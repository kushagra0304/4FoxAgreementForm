const router = require('express').Router();

router.get('/oauth2callback', async (request, response) => {
    return response.send(request.params);
})

router.get('/getAll', async (request, response) => {
    try {
        const companies = await companyModel.find({});

        return response.send(companies);
    } catch(e) {
        response.status(500).send()
    }
});

module.exports = router;