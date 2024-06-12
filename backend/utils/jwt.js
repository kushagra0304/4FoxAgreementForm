// These are not standalone functions which can be used in another projects. 
// Many values are hardcoded for this project
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

class CustomJWTError extends Error {
    constructor(message) {
      super(message);
      this.name = 'JsonWebTokenError';
    }
}

class CustomJWTTimeError extends Error {
    constructor(message) {
      super(message);
      this.name = 'JWTTimeError';
    }
}

class CustomNoJWTError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NoTokenError';
    }
}

const invalidActiveTokens = new Set();

const create = (data, expiresIn) => {
    const dataForToken = { data };

    let token;

    if(!expiresIn) {
        token = jwt.sign(
            dataForToken, 
            config.TOKEN_SECRET,
        )

        return token;
    }

    token = jwt.sign(
        dataForToken, 
        config.TOKEN_SECRET,
        { expiresIn: expiresIn } 
    )

    return token;
}

const invalidate = (token) => {
    invalidActiveTokens.add(token);
}

// This will return nothing if token is valid
// And will throw error if token is invalid
const verify = async (token) => {
    let decodedToken = null;

    if(!token) {
        throw new CustomNoJWTError("Token not provided");
    }

    if(invalidActiveTokens.has(token)) {
        throw new CustomJWTError("Custom Invalid token");
    }

    try {
        decodedToken = jwt.verify(token, config.TOKEN_SECRET)
    } catch(err) {
        // This catches the token expiry error
        invalidActiveTokens.add(token);
        throw err;
    }

    if((decodedToken.exp - ((new Date().getTime)/1000)) < 86400) {
        invalidActiveTokens.add(token);
        throw new CustomJWTTimeError();
    }
}

// This will return only data extracted from valid token.
// Always call verify before calling this
const decode = (token) => {
    decodedToken = jwt.verify(token, config.TOKEN_SECRET)
    return decodedToken.data;
}

module.exports = {
    create,
    invalidate,
    verify,
    decode
}