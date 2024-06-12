const clientModel = require("../schemas/client");
const config = require("./config");
const jwt = require("./jwt");

const createClientPageURL = async (emailId, userId) => {
    const savedClient = await clientModel.create({
        emailId: emailId,
    })
    return `${config.SERVER_DOMAIN}/client?token=${savedClient._id}`;
} 

module.exports = {
    createClientPageURL,
};
