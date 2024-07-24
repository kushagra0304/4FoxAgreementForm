const accessModel = require("../schemas/access");
const config = require("./config");

const checkAccess = async (request, response, next) => {
    try {
        const { userData } = request
        const { emailAddress } = userData

        request.access = {
            owner: false,
            hr: false,
            employee: false,
        }

        if(emailAddress === config.ADMIN_ADDRESS) {
            request.access.owner = true;
        } else if((await accessModel.findOne({ type: 'hr' })).address === emailAddress) {
            request.access.hr = true;
        } else if((await accessModel.find({ type: 'emp' })).find((access) => access.address === emailAddress)) {
            request.access.employee = true;
        }
    } catch (e) {

    } finally {
        next();
    }
} 

const checkAccessFunc = async (emailAddress) => {
    const access = {
        owner: false,
        hr: false,
        employee: false,
    }

    try {
        if(emailAddress === config.ADMIN_ADDRESS) {
            access.owner = true;
        } else if((await accessModel.findOne({ type: 'hr' })).address === emailAddress) {
            access.hr = true;
        } else if((await accessModel.find({ type: 'emp' })).find((access) => access.address === emailAddress)) {
            access.employee = true;
        }
    } catch (e) {

    } finally {
        return access;
    }
}

module.exports = {
    checkAccess,
    checkAccessFunc
};
