const localtunnel = require('localtunnel');
const config = require('./config');
const fs = require('fs');
const https = require('https');

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
        process.exit();
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

module.exports = {
    exposeTheApplicationToWWW,
    generateRandomStateOfLen10
}