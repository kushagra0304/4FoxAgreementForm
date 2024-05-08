const router = require('express').Router();
const axios = require('axios');

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

router.get('/email', async (request, response) => {
    const { userToken } = request.cookies

    if(!tokens.has(userToken)){
        response.clearCookie("userToken");
        return response.status(401).send();
    }

    const user = users[userToken]

    const body = {
        fromAddress: user.accountDetails.primaryEmailAddress,
        toAddress: "kushagra0304@gmail.com",
        // ccAddress: "colleagues@mywork.com",
        // bccAddress: "restadmin1@restapi.com",
        subject: "Email - Always and Forever",
        content: "Email can never be dead. The most neutral and effective way, that can be used for one to many and two way communication.",
        askReceipt : "yes"
    }

    let res;

    try {
        res = await axios.post(`https://mail.zoho.com/api/accounts/${user.accountDetails.zuid}/messages`, body, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${user.authToken.access_token}`
            }
        })

        console.log(res);
    } catch(error) {
        console.log(error)
        return response.status(500).send(error)
    }

    return response.send(res);
})

module.exports = router;