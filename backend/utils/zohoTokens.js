const { default: axios } = require("axios");
const userModel = require("../schemas/user");
const config = require('../utils/config');

const getAccessToken = async (userId) => {
    const user = await userModel.findById(userId);

    if(!user) {
        throw new Error("User not found");
    }

    if(!user.accessToken) {
        throw new Error("User not authenticated to Zoho");
    }

    if((user.expiresAt - 60*5) < (new Date())) {
        const { data } = await axios.post(`https://accounts.zoho.in/oauth/v2/token?refresh_token=${user.refreshToken}&client_id=${config.CLIENT_ID}&client_secret=${config.CLIENT_SECRET}&grant_type=refresh_token`);

        user.accessToken = data.access_token;
        user.expiresAt = (new Date()) + data.expires_in;

        const updatedUser = await user.save()

        return updatedUser.accessToken;
    }

    return user.accessToken;
}

module.exports = {
    getAccessToken
}

