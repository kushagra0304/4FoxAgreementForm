const addressModel = require("../schemas/address");
const logger = require("../utils/logger");
const router = require('express').Router();
const cache = require("../utils/cache");

router.post('', async (request, response) => {
    try {
        const addressToSave = request.body;

        const newAddress = new addressModel(addressToSave);

        const savedAddress = await newAddress.save();

        cache.addAddressToCache(savedAddress.address);

        response.end();
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

router.get('', async (request, response) => {
    try {
        response.json({
            addresses: cache.addresses
        });
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

module.exports = router;