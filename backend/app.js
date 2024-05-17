// ---------------------------------------------------------
// NPM Packages

const express = require('express');
const { default: mongoose } = require('mongoose');
const cookieParser = require('cookie-parser');
require('express-async-errors')

// ---------------------------------------------------------
// My imports 

const config = require('./utils/config');
const oauthRouter = require('./controllers/oauth');
const middlewares = require('./utils/middlewares');
const helper = require('./utils/helper');

// ---------------------------------------------------------
// Initialization

const app = express();
if(config.ENVIROMENT === 'development') { helper.exposeTheApplicationToWWW() }

// ---------------------------------------------------------
// DB connection

// app.use(middlewares.handleDataBaseConnection);

// const url = process.env.MONGODB_URI;

// console.log('Connecting to MongoDB');

// mongoose.connect(url).then(() => {
//   console.log('Connection successfull');
// }).catch((e) => {
//   console.log('Error connecting to MongoDB:', e.message);
// });

// ---------------------------------------------------------
// Middleware list

app.use(express.static(__dirname + '/public'));
app.use(express.json());
if (config.ENVIROMENT === 'development') {
    app.use(require('./utils/middlewares').morganRequestLogger);
}
app.use(cookieParser());
// ----------------------------
// Controllers
app.use('/oauth', oauthRouter);
// ----------------------------
app.use(middlewares.unknownEndpoint);
app.use(middlewares.errorHandler); // this has to be the last loaded middleware.

// ---------------------------------------------------------
// Export express app

module.exports = app;

// ---------------------------------------------------------
