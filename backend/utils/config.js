require('dotenv').config();

// Port will be provided my render servers. 
// Also 10000 is the default port render servers set
const PORT = process.env.port || 10000;

const MONGODB_URI = process.env.MONGODB_URI;

const NODE_ENV = process.env.NODE_ENV;

module.exports = {
  MONGODB_URI,
  PORT,
  NODE_ENV
};