const access = require("../utils/access");
const logger = require("../utils/logger");
const router = require('express').Router();
const accessModel = require("../schemas/access");

router.get('/permission/owner', access.checkAccess, async (request, response) => {
    try {
        if(request.access.owner) {
            response.status(200).send();
        } else {
            response.status(403).send();
        }
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

router.get('/permission/hr', access.checkAccess, async (request, response) => {
    try {

        if(request.access.hr) {
            response.status(200).send();
        } else {
            response.status(403).send();
        }
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

router.get('/address/hr', async (request, response) => {
    try {
        const hrAddress = await accessModel.findOne({ type: 'hr' });

        response.send(hrAddress.address);
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

router.get('/address/employees', async (request, response) => {
    try {
        const employeeAddresses = await accessModel.find({ type: 'emp'});

        response.send(employeeAddresses.map((address) => address.address));
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

router.post('/address/hr', async (request, response) => {
    try {
        const { address } = request.body;

        await accessModel.findOneAndUpdate({ type: 'hr' }, { type: 'hr', address: address }, { upsert: true, new: true });

        response.send();
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

router.post('/address/employees', async (request, response) => {
    try {
        const { addresses } = request.body;

        await accessModel.deleteMany({ type: 'emp' });

        await accessModel.insertMany(addresses.map((address) => ({ type: 'emp', address })));

        response.send();
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

module.exports = router;