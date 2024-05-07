if(process.env.NODE_ENV == "development") {
  require('dotenv').config();
}

// Port will be provided my render servers. 
// Also 10000 is the default port set by render servers
const PORT = process.env.PORT || 10000;

const MONGODB_URI = process.env.MONGODB_URI;

const NODE_ENV = process.env.NODE_ENV;

module.exports = {
  MONGODB_URI,
  PORT,
  NODE_ENV
};