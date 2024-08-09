const { default: axios } = require("axios");
const userModel = require("../schemas/user");
const config = require('../utils/config');
const logger = require('../utils/logger');

const getAccessToken = async (user) => {
    if(!user) {
        throw new Error('User data not provided to getAccessToken')
    }

    if(!user.accessToken) {
        throw new Error("User not authenticated to Zoho");
    }

    if((user.expiresAt)-(60*5) < ((new Date()).getTime())/1000) {
        const { data } = await axios.post(`https://accounts.zoho.in/oauth/v2/token?refresh_token=${user.refreshToken}&client_id=${config.CLIENT_ID}&client_secret=${config.CLIENT_SECRET}&grant_type=refresh_token`);
    
        user.accessToken = data.access_token;
        user.expiresAt = ((new Date()).getTime())/1000 + data.expires_in;

        const updatedUser = await user.save()

        logger.debug("Access token refrshed");

        return updatedUser.accessToken;
    }

    return user.accessToken;
}

module.exports = {
    getAccessToken
}

