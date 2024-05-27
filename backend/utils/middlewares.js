const { default: mongoose } = require('mongoose');
const morgan = require('morgan');
const logger = require('../utils/logger');
const jwt = require('../utils/jwt')
const zohoTokens = require('./zohoTokens');
const userModel = require('../schemas/user');
const path = require('path');

// This one logs any request made to the server
// One important thing to note. it only logs those request which have a response.
// No response indicates server error.
const morganRequestLogger = morgan((tokens, req, res) => {
    if (tokens.method(req, res) === 'POST') {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify(req.body),
      ].join(' ');
    }
  
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
    ].join(' ');
})

const handleDataBaseConnection = (request, response, next) => {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({
      error: 'Database not connected',
    });
  }
   next();
};

const checkJWT = async (request, response, next) => {
  logger.debug(new Date());
  const { userToken } = request.cookies;

  if(!userToken) { 
    request.errorInAuth = true;
    request.authError = {};
    next();
    return;
  }

  try {
    await jwt.verify(userToken);

    const decodedTokenData = jwt.decode(userToken);

    request.userId = decodedTokenData.userId;
  } catch(error) {
    if (error.name === 'JWTTimeError') {
      const decodedTokenData = jwt.decode(userToken);
      request.userId = decodedTokenData.userId;
      const newToken = jwt.create(decodedTokenData, 60*60*24*7);
      response.cookie('userToken', newToken, { httpOnly: true, secure: true, sameSite: "strict" });
      next();
      return;
    }

    request.errorInAuth = true;
    request.authError = error;
  }

  next();
};

const setAccessToken = async (request, response, next) => {
  const { userId } = request;

  if(!userId) { 
    request.errorInAuth = true;
    request.authError = {};
    next();
    return;
  }

  try {
    request.accessToken = await zohoTokens.getAccessToken(userId);
  } catch(error) {
    request.errorInAuth = true;
    request.authError = error;
  }

  next();
};

const setUserData = async (request, response, next) => {
  const { userId } = request;

  if(!userId) { 
    request.errorInAuth = true;
    request.authError = {};
    next();
    return;
  }

  try {
    const user = await userModel.findById(userId);

    request.userData = {
      zohoAccountId: user.zohoAccountId,
      emailAddress: user.emailAddress
    }
  } catch(error) {
    request.errorInAuth = true;
    request.authError = error;
  }
  
  logger.debug(new Date());
  next();
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    logger.debug(error.name);
    logger.debug(error.message);
    logger.debug(error)
    return response.status(400).send({ error: 'malformatted id' });
  } 
  
  if (error.name === 'ValidationError') {
    logger.debug(request.authError.name);
    logger.debug(request.authError.message);
    logger.debug(request.authError)
    response.clearCookie();
    response.status(401).json({ error: request.authError.message });
  } 

  next(error);
};

module.exports = {
  morganRequestLogger,
  handleDataBaseConnection,
  errorHandler,
  unknownEndpoint,
  checkJWT,
  setAccessToken,
  setUserData,
}