const logger = require("../utils/logger");
const router = require('express').Router();
const emailModel = require("../schemas/email");

router.post('', async (request, response) => {
    try {
        const { searchQuery, page, limit, fromFilter } = request.body;

        const skip = (page - 1) * limit;

        const docs = await emailModel
            .find({
              $text: { $search: searchQuery },
              $or: [{ from: { $eq: fromFilter }}]
            })
            .sort({ dateField: 1 })
            .skip(skip)
            .limit(limit)

        response.send(docs);
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

module.exports = router;