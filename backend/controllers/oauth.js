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
const tokens = new Set();
const people = {};

router.get('/callback', async (request, response) => {
    const {location, code, state} = request.query;
    const accountsServer = request.query['request.query'];


    // if(!state || !states.has(state)) {
    //     return response.status(401).send();
    // } else {
    //     states.delete(state);
    // }

    const token = generateRandomStateOfLen10();


    response.cookie('userToken', token, { maxAge: 86400000, httpOnly: true });

    response.setHeader('Location', 'https://fourfoxagreementform.onrender.com');
    response.status(302);

    return response.send();
    // return response.redirect('https://fourfoxagreementform-1.onrender.com');
})

router.get('/stateForOAuth', async (request, response) => {
    const state = generateRandomStateOfLen10();
    states.add(state);
    console.log(states);
    return response.send(state);
})

module.exports = router;