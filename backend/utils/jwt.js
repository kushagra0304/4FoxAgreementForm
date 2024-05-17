// These are not standalone functions which can be used in another projects. 
// Many values are hardcoded for this project
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const invalidActiveTokens = new Set();

const create = (data, expiresIn) => {
    const dataForToken = { data };

    const token = jwt.sign(
        dataForToken, 
        config.TOKEN_SECRET,
        { expiresIn: expiresIn } 
    )

    return token;
}

const invalidate = (token) => {
    invalidActiveTokens.add(token);
}

const verify = (token) => {
    if(invalidActiveTokens.has(token)) {
        return false;
    }

    try {
        jwt.verify(token, config.TOKEN_SECRET)
    } catch(err) {
        invalidActiveTokens.add(token);
        return false;
    }
    
    return true;
}

const decode = (token) => {
    let decodedToken = null;

    try {
        decodedToken = jwt.verify(token, config.TOKEN_SECRET)
    } catch(err) {
        return null;
    }
    
    return decodedToken;
}

module.exports = {
    create,
    invalidate,
    verify,
    decode
}