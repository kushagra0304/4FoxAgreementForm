// ---------------------------------------------------------
// NPM Packages

const express = require('express');
const { default: mongoose } = require('mongoose');

// ---------------------------------------------------------
// My imports 

const config = require('./utils/config');
const middlewares = require('./utils/middlewares');

// ---------------------------------------------------------
// Initialization

const app = express();

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

app.use(express.json());
if (config.NODE_ENV === 'development') {
    app.use(require('./utils/middlewares').morganRequestLogger);
}
// ----------------------------
// Controllers

// app.use('/api/dispatch', dispatchRouter);
// app.use('/api/stock', stockRouter);
// app.use('/api/order', orderRouter);
// app.use('/api/company', companyRouter);
// ----------------------------
app.use(middlewares.unknownEndpoint);
app.use(middlewares.errorHandler); // this has to be the last loaded middleware.

// ---------------------------------------------------------
// Export express app

module.exports = app;

// ---------------------------------------------------------
