const router = require('express').Router();
const axios = require('axios');
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");

function generateRandomStateOfLen10() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (let i = 0; i < 10; i++) {
        state += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return state;
}

const states = new Set();
const tokens = new Set();
const users = {};

router.get('/callback', async (request, response) => {
    const {location, code, state} = request.query;
    const accountsServer = request.query['accounts-server'];

    if(!state || !states.has(state)) {
        return response.status(401).send();
    } else {
        states.delete(state);
    }

    const token = generateRandomStateOfLen10();

    const redirect_uri = `https://fourfoxagreementform.onrender.com/oauth/callback`;
    const scope = `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`;
    
    try {
        const accessTokenRes = await axios.post(`${accountsServer}/oauth/v2/token?code=${code}&grant_type=authorization_code&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${redirect_uri}&scope=${scope}`);
        console.log(accessTokenRes)
        tokens.add(token);
        users[token] = {
            authToken: accessTokenRes.data
        }
    } catch(error) {
        return response.status(401).send(error);
    }

    try {
        const { data } = await axios.get(`https://mail.zoho.${location}/api/accounts`, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${users[token].authToken.access_token}`
            }
        });

        console.log(data);

        users[token].accountDetails = data.data[0]
    } catch(error) {
        return response.status(401).send(error);
    }

    console.log(users[token])

    response.cookie('userToken', token, { maxAge: 86400000, httpOnly: true });
    response.setHeader('Location', 'https://fourfoxagreementform.onrender.com');
    response.status(302);

    return response.send();
    // return response.redirect('https://fourfoxagreementform-1.onrender.com');
})

router.get('/stateForOAuth', async (request, response) => {
    const state = generateRandomStateOfLen10();
    states.add(state);
    return response.send(state);
})

router.get('/checkJWT', async (request, response) => {
    const { userToken } = request.cookies

    if(!tokens.has(userToken)){
        response.clearCookie("userToken");
        return response.status(401).send();
    }

    return response.send();
})

router.post('/email', async (request, response) => {
    const { userToken } = request.cookies
    const { body } = request

    if(!tokens.has(userToken)){
        response.clearCookie("userToken");
        return response.status(401).send();
    }

    const user = users[userToken]

    const content = fs.readFileSync(
        path.resolve(__dirname, "template.docx"),
        "binary"
    );

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    doc.render({
        DateOfAgreementExecution: body.DateOfAgreementExecution,
        ClientName: body.ClientName,
        ConstitutionOfBusiness: body.ConstitutionOfBusiness,
        ClientAddress: body.ClientAddress,
        SellersRepresentativeDesignation: body.SellersRepresentativeDesignation,
        AgreementTimePeriod: body.AgreementTimePeriod,
        MarketPlace: body.MarketPlace,
        PackageDuration: body.PackageDuration,
        AdvancePackageAmount: body.AdvancePackageAmount,
        TermsConditionsOfSales: body.TermsConditionsOfSales
    });

    // Get the zip document and generate it as a nodebuffer
    const buf = doc.getZip().generate({
        type: "nodebuffer",
        // compression: DEFLATE adds a compression step.
        // For a 50MB output document, expect 500ms additional CPU time
        compression: "DEFLATE",
    });

    let fileRes;

    try {

        const headers = {
            'Content-Type': 'application/octet-stream',
            "Authorization": `Zoho-oauthtoken ${user.authToken.access_token}`
        };

        fileRes = await axios.post(
            `https://mail.zoho.in/api/accounts/${user.accountDetails.accountId}/messages/attachments?fileName=Agreement-form.pdf`, 
            buf, 
            { headers }
        )

        console.log(fileRes)

    } catch(error) {
        return response.status(500).send("error sending file");
    }


    const data = {
        fromAddress: user.accountDetails.primaryEmailAddress,
        toAddress: body.emailAddressOfRecipient,
        ccAddress: body.emailAddressOfCC,
        // bccAddress: "restadmin1@restapi.com",
        subject: body.subject,
        content: body.bodyOfMail,
        askReceipt : "yes",
        attachments: [
            {
               storeName: fileRes.data.data.storeName,
               attachmentPath: fileRes.data.data.attachmentPath,
               attachmentName: fileRes.data.data.attachmentName
            }
         ]
    }

    let res;

    // console.log("Ehhhh");

    try {
        res = await axios.post(`https://mail.zoho.in/api/accounts/${user.accountDetails.accountId}/messages`, data, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${user.authToken.access_token}`
            }
        })

        console.log(res);
    } catch(error) {
        console.log(error)
        return response.status(500).send(error)
    }

    if(res.data.status.code === 200) {
        response.send();
    } else {
        response.status(500).send()
    }
})

module.exports = router;