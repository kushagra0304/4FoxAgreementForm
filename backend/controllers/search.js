const logger = require("../utils/logger");
const router = require('express').Router();
const emailModel = require("../schemas/email");
const { searchInEmails } = require("../utils/search");

router.post('', async (request, response, next) => {
    try {
        // if(request.errorInAuth) {
        //     next({ name: "ValidationError" });
        //     return;
        // }

        const docs = await searchInEmails(request.body);

        response.send(docs);
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

module.exports = router;