const localtunnel = require('localtunnel');
const config = require('./config');
const fs = require('fs');
const https = require('https');
const AddressModel = require('../schemas/address');
const cache = require('./cache');
const logger = require('./logger');

function getPublicIPAddress() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData.ip);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function extractSubdomain(url) {
    // Remove the protocol part (http://, https://, etc.)
    const urlWithoutProtocol = url.replace(/^(https?:\/\/)/, '');
  
    // Split the URL into parts
    const urlParts = urlWithoutProtocol.split('/')[0].split('.');
  
    // Check if the URL has a subdomain
    if (urlParts.length > 2) {
      // Remove the top-level domain (e.g., .com, .org, .net) and the second-level domain (e.g., example, google)
      const subdomain = urlParts.slice(0, -2).join('.');
      return subdomain;
    }
  
    // If no subdomain, return an empty string
    return '';
  }

const exposeTheApplicationToWWW = async () => {
    console.log("Trying to tunnel");
    const tunnel = await localtunnel(config.PORT, { subdomain: "hft75d6rcy" });

    tunnel.on('close', () => {
        console.log("Tunnel closed");
    });

    tunnel.on('error', (err) => {
        console.log("Failed to tunnel: " + err);
    });

    tunnel.on('request', (info) => {
        console.log(info);
    });

    process.on("SIGINT", () => {
        tunnel.close();
    })

    // the assigned public url for your tunnel
    // https://hft75d6rcy.loca.lt
    if(extractSubdomain(tunnel.url) !== "hft75d6rcy") {
        console.log("Closing tunnel because didn't get wanted subdomain");
        tunnel.close();
        exposeTheApplicationToWWW();
        return;
    }
  
    console.log("Tunneled to: " + tunnel.url);
    const ipAddress = await getPublicIPAddress();
    console.log('Public IP Address:', ipAddress);
}

function generateRandomStateOfLen10() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  for (let i = 0; i < 10; i++) {
      state += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return state;
}

const saveAddresInDb = async (adderss) => {
  try {
    const newAddress = new addressModel(adderss);

    const savedAddress = await newAddress.save();

    cache.addAddressToCache(savedAddress.address);

    return true;
  } catch(error) {
    logger.debug(error);
    return false;
  }
}

function addBrTagsInplaceNewline(text) {
  // Replace newline characters with <br> tags
  return text.replace(/\n/g, '<br>');
}

function difference(setA, setB) {
  let _difference = new Set(setA);
  for (let elem of setB) {
      _difference.delete(elem);
  }
  return _difference;
}


const addAddresses = async (toAddresses, ccAddresses) => {
  try {
    const cacheAddressSet = new Set(cache.getAddresses());
    const toAddressSet = new Set(toAddresses);
    const ccAddressSet = new Set(ccAddresses);

    const newToAddresses = difference(toAddressSet, cacheAddressSet);
    const newCCAddresses = difference(ccAddressSet, cacheAddressSet);
    const newAddresses = new Set([...newToAddresses, ...newCCAddresses]);

    console.log(newAddresses);

    for (let address of newAddresses) {
      const existingAddress = await AddressModel.findOne({ address: address });
      if (existingAddress) { continue; }
      try {
        const savedAddress = await AddressModel.create({ address: address });
        cache.addAddressToCache(savedAddress.address);
      } catch(e) {
        continue;
      }
    }

  } catch(error) {
    logger.debug("Error while saving new address");
    logger.debug(error);
  }
}

function extractAgreementFormDataFieldsAndStripThem(originalObj) {
  const newObj = {};
  for (const key in originalObj) {
      if (originalObj.hasOwnProperty(key)) {
          if (key.startsWith('agreementFormData_')) {
              const newKey = key.replace('agreementFormData_', '');
              newObj[newKey] = originalObj[key];
          } else {
              newObj[key] = originalObj[key];
          }
      }
  }
  return newObj;
}

module.exports = {
    exposeTheApplicationToWWW,
    generateRandomStateOfLen10,
    saveAddresInDb,
    addBrTagsInplaceNewline,
    addAddresses,
    extractAgreementFormDataFieldsAndStripThem
}