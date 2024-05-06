const router = require('express').Router();

function generateRandomStateOfLen10() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (let i = 0; i < 10; i++) {
        state += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return state;
}

const states = new Set();
const people = {};

router.get('/callback', async (request, response) => {
    const {location, code, state} = request.query;
    const accountsServer = request.query['request.query'];
    console.log(request.query);
    console.log(states);
    return response.send(request.query);
})

router.get('/stateForOAuth', async (request, response) => {
    const state = generateRandomStateOfLen10();
    states.add(state);
    return response.send(state);
})

module.exports = router;