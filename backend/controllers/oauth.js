const router = require('express').Router();
const axios = require('axios');
const config = require('../utils/config');
const logger = require('../utils/logger');
const jwt = require('../utils/jwt')
const userModel = require('../schemas/user');
const path = require('path');
const { checkAccessFunc } = require('../utils/access');
const fs = require('fs');

function generateRandomStateOfLen10() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (let i = 0; i < 10; i++) {
        state += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return state;
}

const states = new Set();

// The following endpoint is called by zoho after successful user authentication.
// This endpoint is supposed to be set at https://api-console.zoho.com in "Authorized Redirect URIs" field of "client details" form
// The endpoint is: https://fourfoxagreementform.onrender.com/oauth/callback
router.get('/callback', async (request, response) => {
    const { location, code, state } = request.query;
    const accountsServer = request.query['accounts-server'];

    let accessTokenRes;
    let accountDetailsRes;

    logger.debug("location: " + location + ", code: " + code + ", state: " + state + ", accountsServer: " + accountsServer); // debug


    if(!state || !states.has(state)) {
        response.status(401).send();
        return;
    } else {
        states.delete(state);
    }
    
    let redirect_uri = `${config.SERVER_DOMAIN}/oauth/callback`;
    const scope = `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`;
    
    // Fetching authorization code
    logger.debug("Fetching authorization code"); // debug
    try {
        accessTokenRes = await axios.post(`${accountsServer}/oauth/v2/token?code=${code}&grant_type=authorization_code&client_id=${config.CLIENT_ID}&client_secret=${config.CLIENT_SECRET}&redirect_uri=${redirect_uri}&scope=${scope}`);
    } catch(error) {
        logger.debug("Failed to fetch authorization code"); // debug
        logger.debug(error); // debug
        response.status(401).send();
        return;
    }
    logger.debug("Authorization code fetched successfully."); // debug

    // Fetching account details of the user
    logger.debug("Fetching account details of the user"); // debug
    try {
        accountDetailsRes = await axios.get(`https://mail.zoho.${location}/api/accounts`, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessTokenRes.data.access_token}`
            }
        });
        // users[token].accountDetails = data.data[0]
    } catch(error) {
        logger.debug("Failed to fetch account details of the user"); // debug
        logger.debug(error); // debug
        response.status(401).send();
        return;
    }
    logger.debug("Account details fetched successfully"); // debug

    try {
        const emailAddress = accountDetailsRes.data.data[0].primaryEmailAddress
        const access = await checkAccessFunc(emailAddress);

        logger.debug("Checking if email address is authorized");
        if(!access.owner && !access.employee && !access.hr) {
            throw new Error("Email address does not have permission to use application.");
        }
        logger.debug("email address is authorized");
    } catch(error) {
        logger.debug(error); // debug
        response.status(500).send((await fs.promises.readFile(path.join(__dirname, "../public/error.html"))).toString());
        return;
    }

    let userId;

    try {
        logger.debug("Checking if user exist in the DB"); // debug
        const emailAddress = accountDetailsRes.data.data[0].primaryEmailAddress
        const doc = await userModel.findOne({ emailAddress: emailAddress});

        if(doc){
            logger.debug("User exists"); // debug
            
            const criteria = { emailAddress: emailAddress };
            const update = { $set: { 
                accessToken: accessTokenRes.data.access_token,
                refreshToken: accessTokenRes.data.refresh_token,
                expiresAt: ((new Date()).getTime())/1000 + accessTokenRes.data.expires_in,
                zohoAccountId: accountDetailsRes.data.data[0].accountId,
            } };
            const options = { new: true, useFindAndModify: false };

            const updatedUser = await userModel.findOneAndUpdate(criteria, update, options);
            userId = updatedUser._id.toString();
            logger.debug("User updated: ", updatedUser); // debug
        } else {
            logger.debug("User does not exist"); // debug
            const newUser = new userModel({
                accessToken: accessTokenRes.data.access_token,
                refreshToken: accessTokenRes.data.refresh_token,
                expiresAt: ((new Date()).getTime())/1000 + accessTokenRes.data.expires_in,
                emailAddress: accountDetailsRes.data.data[0].primaryEmailAddress,
                emails: [],
                zohoAccountId: accountDetailsRes.data.data[0].accountId,
            })
            const savedNewUser = await newUser.save();
            userId = savedNewUser._id.toString();
            logger.debug("New user saved in DB: ", savedNewUser); // debug
        }
    } catch(error) {
        logger.debug("Failed to update DB"); // debug
        logger.debug(error); // debug
        response.status(500).send();
        return;
    }

    const dataForToken = {
        userId: userId
    }
    const token = jwt.create(dataForToken, 60*60*24*7);

    response.cookie('userToken', token, { httpOnly: true, secure: true, sameSite: "strict" });
    response.setHeader('Location', config.SERVER_DOMAIN);
    response.status(302);

    response.send();
});

router.get('/stateForOAuth', async (request, response) => {
    const state = generateRandomStateOfLen10();
    states.add(state);
    response.send(state);
});

router.get('/logout', async (request, response, next) => {
    if(request.errorInAuth) {
        next({ name: "ValidationError" });
        return;
    }

    const { userToken } = request.cookies
    jwt.invalidate(userToken);
    response.clearCookie("userToken");
    response.status(200).send();
});

router.get('/checkJWT', async (request, response, next) => {
    if(request.errorInAuth) {
        next({ name: "ValidationError" });
        return;
    }

    response.send();
    return;
});

router.get('/redirect_url', async (request, response) => {
    response.send(config.SERVER_DOMAIN);
    return;
});

module.exports = router;