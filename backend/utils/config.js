const crypto = require('crypto');
if(process.env.ENVIROMENT === "development") {
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
const ENVIROMENT = process.env.ENVIROMENT;
const MONGODB_URI = ENVIROMENT === "development" ? process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD;
const TUNNEL_SERVICE = process.env.TUNNEL_SERVICE
let SERVER_DOMAIN = "https://fourfoxagreementform.onrender.com";
if(ENVIROMENT === "development") {
  if(TUNNEL_SERVICE === 'loca') {
    SERVER_DOMAIN = "https://hft75d6rcy.loca.lt"
  } else if(TUNNEL_SERVICE === 'serveo') {
    SERVER_DOMAIN = "https://fourfox.serveo.net"
  }
}
const TOKEN_SECRET = generateTokenSecret();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
 
module.exports = {
  MONGODB_URI,
  PORT,
  ENVIROMENT,
  SERVER_DOMAIN,
  TOKEN_SECRET,
  CLIENT_ID,
  CLIENT_SECRET,
  TUNNEL_SERVICE
};