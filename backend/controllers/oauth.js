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
const people = {};

router.get('/callback', async (request, response) => {
    const {location, code, state} = request.query;
    const accountsServer = request.query['request.query'];

    if(!state || !states.has(state)) {
        return response.status(401).send();
    } else {
        states.delete(state);
    }

    const client_id = `1000.YV31DC9CODX4PYC0C5YPRWX5WNR0MB`;
    const client_secret = `8a6853f66a377bf47958c8264a42f57847b44e98f2`;
    const redirect_uri = `https://fourfoxagreementform.onrender.com/oauth/callback`;
    const scope = `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`;
    axios.post(`https://accounts.zoho.com/oauth/v2/token?code=${code}&grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&scope=${scope}`).then((res) => {
        console.log(res);
    })

    const token = generateRandomStateOfLen10();

    tokens.add(token);


    response.cookie('userToken', token, { maxAge: 86400000, httpOnly: true });

    response.setHeader('Location', 'https://fourfoxagreementform.onrender.com');
    response.status(302);

    return response.send();
    // return response.redirect('https://fourfoxagreementform-1.onrender.com');
})

router.get('/stateForOAuth', async (request, response) => {
    const state = generateRandomStateOfLen10();
    states.add(state);
    console.log(states);
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

module.exports = router;