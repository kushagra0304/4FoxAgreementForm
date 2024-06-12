const { default: mongoose } = require('mongoose');
const morgan = require('morgan');
const logger = require('../utils/logger');
const jwt = require('../utils/jwt')
const zohoTokens = require('./zohoTokens');
const userModel = require('../schemas/user');
const path = require('path');
const fs = require('fs');

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

const authenticateUser = async (request, response, next) => {
  try {
    const { userToken } = request.cookies;
    await jwt.verify(userToken);
    const decodedTokenData = jwt.decode(userToken);
    request.userId = decodedTokenData.userId;

    const user = await userModel.findById(request.userId);
    if(!user) {
      throw new Error("User not found");
    }
    request.userData = user;

    request.accessToken = await zohoTokens.getAccessToken(request.userData);
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
}

const unknownEndpoint = async (request, response) => {
  response.status(404).send((await fs.promises.readFile(path.join(__dirname, "../public/notFound.html"))).toString());
};

const errorHandler = async (error, request, response, next) => {
  if (error.name === 'CastError') {
    logger.debug(error.name);
    logger.debug(error.message);
    logger.debug(error)
    response.status(400).send({ error: 'malformatted id' });
    return;
  } 

  if (error.name === 'ValidationError') {
    logger.debug(request.authError.name);
    logger.debug(request.authError.message);
    logger.debug(request.authError)
    // Fix this before production
    response.clearCookie();
    response.status(401).json({ error: request.authError.message });
    return;
  } 

  logger.debug(error);
  response.status(500).send((await fs.promises.readFile(path.join(__dirname, "../public/error.html"))).toString());

  next(error);
};

module.exports = {
  morganRequestLogger,
  handleDataBaseConnection,
  errorHandler,
  unknownEndpoint,
  authenticateUser
}