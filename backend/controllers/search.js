const addressModel = require("../schemas/address");
const logger = require("../utils/logger");
const router = require('express').Router();
const cache = require("../utils/cache");
const emailModel = require("../schemas/email");

router.post('', async (request, response) => {
    try {
        const { searchQuery, page, limit } = request.body;

        const skip = (page - 1) * limit;

        // response.send(await emailModel
        //     .find({$text: { $search: searchQuery }})
        //     .sort({ dateField: 1 })
        //     .skip(skip)
        //     .limit(limit)
        // );

        response.send(await emailModel
            .find({$text: { $search: 'dasdsada' }})
        );
    } catch(error) {
        // logger.debug(error)
        response.status(500).send(error.message);
    }
})

module.exports = router;