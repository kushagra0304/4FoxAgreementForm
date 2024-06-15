// ---------------------------------------------------------
// NPM Packages

const express = require('express');
const { default: mongoose } = require('mongoose');
const cookieParser = require('cookie-parser');

// ---------------------------------------------------------
// My imports 

const config = require('./utils/config');
const oauthRouter = require('./controllers/oauth');
const emailRouter = require('./controllers/email');
const searchRouter = require('./controllers/search');
const downloadRouter = require('./controllers/download');
const addressRouter = require('./controllers/address');
const clientRouter = require('./controllers/client');
const middlewares = require('./utils/middlewares');
const helper = require('./utils/helper');
const cache = require('./utils/cache');
const logger = require('./utils/logger');
const templatesUtils = require('./utils/templates');
const emailModel = require('./schemas/email');
const userModel = require('./schemas/user');

// ---------------------------------------------------------
// Initialization

const app = express();
if(config.ENVIROMENT === 'development' && config.TUNNEL_SERVICE === 'loca') { helper.exposeTheApplicationToWWW() }

// ---------------------------------------------------------
// DB connection

app.use(middlewares.handleDataBaseConnection);

const url = config.MONGODB_URI;

console.log('Connecting to MongoDB');

mongoose.connect(url).then(async () => {
  console.log('Connection successfull to MongoDB');
  // templatesUtils.clearTemplateFolderAndDownloadAllTemplates();
  try {
    await emailModel.deleteMany({});
    console.log("Emails deleted successfully");
  } catch (e) {
    console.log("Failed to delete all emails", e);
  }

  const testData = [
    {
      userId: '666dbfe5ad992c2c7ed3cf91',
      from: 'sender@example.com',
      to: ['recipient1@example.com', 'recipient2@example.com'],
      cc: ['cc1@example.com'],
      subject: 'Test Email 1',
      body: 'This is the body of test email 1.',
      agreementType: 'Standard',
      clientAgreed: true,
      createdAt: new Date('June 1, 2023 10:00:00 AM UTC'),
      agreementFormData_field1: 'Value 1',
      agreementFormData_field2: 'Value 2'
    },
    {
      userId: '666dbfe5ad992c2c7ed3cf91',
      from: 'another.sender@example.com',
      to: ['recipient3@example.com'],
      cc: ['cc2@example.com', 'cc3@example.com'],
      subject: 'Test Email 2',
      body: 'This is the body of test email 2.',
      agreementType: 'Premium',
      clientAgreed: false,
      createdAt: new Date('June 2, 2023 11:00:00 AM UTC'),
      agreementFormData_field1: 'Value 3',
      agreementFormData_field3: 'Value 4'
    },
    {
      userId: '666dbfe5ad992c2c7ed3cf91',
      from: 'third.sender@example.com',
      to: ['recipient4@example.com'],
      cc: [],
      subject: 'Test Email 3',
      body: 'This is the body of test email 3.',
      agreementType: 'Basic',
      clientAgreed: true,
      createdAt: new Date('June 3, 2023 12:00:00 PM UTC'),
      agreementFormData_field2: 'Value 5',
      agreementFormData_field4: 'Value 6'
    }
  ];

  try {
    await emailModel.insertMany(testData)
    console.log('Test data inserted successfully');
  } catch(e) {
    console.error('Error inserting test data:', e);
  }
}).catch((e) => {
  console.log('Error connecting to MongoDB:', e.message);
});

mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');
// ---------------------------------------------------------
// Init Cache

cache.initAddressCache().then(() => {
  console.log("Address cache init successfully");
}).catch((error) => {
  console.log("Address cache init not success: " + error.message);
})

cache.initPptrBrowserInstance().then(() => {
  console.log("Pptr browser instance init successfully");
}).catch((error) => {
  console.log("Pptr browser instance init not success: " + error.message);
})
// ---------------------------------------------------------
// Middleware list
if (config.ENVIROMENT === 'development') {
  app.use(require('./utils/middlewares').morganRequestLogger);
}
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cookieParser());
app.use(middlewares.authenticateUser)
// ----------------------------
// Controllers
app.use('/oauth', oauthRouter);
app.use('/email', emailRouter);
app.use('/search', searchRouter);
app.use('/download', downloadRouter);
app.use('/address', addressRouter);
app.use('/client', clientRouter);
// ----------------------------
app.use(middlewares.unknownEndpoint);
app.use(middlewares.errorHandler); // this has to be the last loaded middleware.

// ---------------------------------------------------------
// Export express app

module.exports = app;

// ---------------------------------------------------------
