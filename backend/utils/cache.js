// Highly customized cache
const addressModel = require("../schemas/address");

const addresses = []
const states = new Set();

const initAddressCache = async () => {
    const allAddressesDoc = await addressModel.find({});
    allAddressesDoc.forEach(doc => addresses.push(doc.address))
}

const addAddressToCache = async (address) => {
    addresses.push(address)
}

module.exports = {
    addresses,
    initAddressCache,
    addAddressToCache,
    states,
}