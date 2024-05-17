const crypto = require('crypto');
if(process.env.ENVIROMENT == "development") {
  require('dotenv').config();
}

const generateTokenSecret = (length = 32) => {
  try {
    const buffer = crypto.randomBytes(length);
    const tokenSecret = buffer.toString('hex');
    return tokenSecret;
  } catch (err) {
    console.log("Error generating token secret");
    throw err;
  }
}

// Port will be provided my render servers. 
// Also 10000 is the default port set by render servers
const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI;
const ENVIROMENT = process.env.ENVIROMENT;
const SERVER_DOMAIN = ENVIROMENT === "development" ? "https://hft75d6rcy.loca.lt" : "https://fourfoxagreementform.onrender.com";
const TOKEN_SECRET = generateTokenSecret();
 
module.exports = {
  MONGODB_URI,
  PORT,
  ENVIROMENT,
  SERVER_DOMAIN,
  TOKEN_SECRET
};