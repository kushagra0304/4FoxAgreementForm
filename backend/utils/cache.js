const { default: puppeteer } = require("puppeteer");
const addressModel = require("../schemas/address");

class Cache {
    constructor() {
        this.addresses = [];
        this.states = new Set();
        this.browser = null;
    }

    async initAddressCache() {
        try {
            const allAddressesDoc = await addressModel.find({});
            allAddressesDoc.forEach(doc => this.addresses.push(doc.address));
        } catch (error) {
            console.error("Error initializing address cache:", error);
        }
    }

    async addAddressToCache(address) {
        this.addresses.push(address);
    }

    async initPptrBrowserInstance() {
        this.browser = await puppeteer.launch();

        process.on("SIGINT", async () => {
            console.log("Closing browser");
            await this.closePptrBrowserInstance();
        });
    }

    async closePptrBrowserInstance() {
        if (this.browser) {
            await this.browser.close();
            console.log("Browser closed successfully");
        }
    }

    getBrowser() {
        return this.browser;
    }

    getAddresses() {
        return this.addresses;
    }

    getStates() {
        return this.states;
    }
}

module.exports = new Cache();
