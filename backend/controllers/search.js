const logger = require("../utils/logger");
const router = require('express').Router();
const emailModel = require("../schemas/email");

router.post('', async (request, response) => {
    try {
        const { searchQuery, page, limit, from, clientAgreed, startDate, endDate } = request.body;

        const skip = (page - 1) * limit;

        let fromFilter = {};
        if (from) {
            fromFilter = { from: from };
        }

        let clientAgreedFilter = {};
        if (clientAgreed) {
            clientAgreedFilter = { clientAgreed: true };
        }

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
        }

        let searchQueryFilter = {};
        if(searchQuery) {
            searchQueryFilter = { $text: { $search: `"${searchQuery}"` } };
        }

        let query = emailModel
            .find({
                ...searchQueryFilter,
                ...fromFilter,
                ...clientAgreedFilter,
                ...dateFilter
            })
            .sort({ createdAt: -1 })

        if(limit) {
            query = query.skip(skip).limit(limit)
        }

        const docs = await query.exec();

        response.send(docs);
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

module.exports = router;