const logger = require("../utils/logger");
const router = require('express').Router();
const cache = require("../utils/cache");

router.get('', async (request, response) => {
    try {
        response.json({
            addresses: cache.getAddresses()
        });
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

module.exports = router;