const router = require('express').Router();
const axios = require('axios');
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const config = require('../utils/config');
const logger = require('../utils/logger');
// const jwt = require('jsonwebtoken');
const jwt = require('../utils/jwt')

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
const invalidActiveTokens = new Set();

// The following endpoint is called by zoho after successful user authentication.
// This endpoint is supposed to be set at https://api-console.zoho.com in "Authorized Redirect URIs" field of "client details" form
// The endpoint is: https://fourfoxagreementform.onrender.com/oauth/callback
router.get('/callback', async (request, response) => {
    const {location, code, state} = request.query;
    const accountsServer = request.query['accounts-server'];

    let accessTokenRes;
    let accountDetailsRes;

    // debug
    logger.debug("location: " + location + ", code: " + code + ", state: " + state + ", accountsServer: " + accountsServer);

    if(!state || !states.has(state)) {
        return response.status(401).send();
    } else {
        states.delete(state);
    }
    
    let redirect_uri = `${config.SERVER_DOMAIN}/oauth/callback`;
    const scope = `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`;
    
    // Fetching authorization code
    // debug
    logger.debug("Fetching authorization code");
    try {
        accessTokenRes = await axios.post(`${accountsServer}/oauth/v2/token?code=${code}&grant_type=authorization_code&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${redirect_uri}&scope=${scope}`);
        // tokens.add(token);
        // users[token] = {
        //     authToken: accessTokenRes.data
        // }
    } catch(error) {
        // debug
        logger.debug("Failed to fetch authorization code");
        logger.debug(error);
        return response.status(401).send();
    }
    // debug
    logger.debug("Authorization code fetched successfully.");

    // Fetching account details of the user
    // debug
    logger.debug("Fetching account details of the user");
    try {
        accountDetailsRes = await axios.get(`https://mail.zoho.${location}/api/accounts`, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessTokenRes.data.access_token}`
            }
        });

        // users[token].accountDetails = data.data[0]
    } catch(error) {
        // debug
        logger.debug("Failed to fetch account details of the user");
        logger.debug(error);
        return response.status(401).send();
    }
    // debug
    logger.debug("Account details fetched successfully");

    const dataForToken = {
        email: accountDetailsRes.data.data[0].emailAddress[0].mailId
    }
    const token = jwt.create(dataForToken, 60*60*24);

    logger.debug(token);

    response.cookie('userToken', token, { maxAge: 86400000, httpOnly: true, secure: true });
    response.setHeader('Location', config.SERVER_DOMAIN);
    response.status(302);

    return response.send();
})

router.get('/stateForOAuth', async (request, response) => {
    const state = generateRandomStateOfLen10();
    states.add(state);
    return response.send(state);
})

router.get('/logout', async (request, response) => {
    const { userToken } = request.cookies
    invalidActiveTokens.add(userToken);
    response.clearCookie("userToken");
    return response.status(200).send();
})

router.get('/checkJWT', async (request, response) => {
    const { userToken } = request.cookies
    
    if(!jwt.verify(userToken)) {
        response.clearCookie("userToken");
        return response.status(401).json({ error: "Invalid Token" });
    }

    let decodedToken = jwt.decode(userToken);

    if((decodedToken.exp-(Date.now()/1000)) <= 3600) {
        jwt.invalidate(userToken);
        const newToken = jwt.create(decodedToken.data, 60*60*24);
        response.cookie('userToken', newToken, { maxAge: 86400000, httpOnly: true, secure: true });
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
            `https://mail.zoho.in/api/accounts/${user.accountDetails.accountId}/messages/attachments?fileName=Agreement-form.docx`, 
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