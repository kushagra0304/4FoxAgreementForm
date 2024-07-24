import axios from 'axios';

let base = '';

if(import.meta.env.DEV) {
    base = '/api';
}

// No point in handling errors here.

export const getOwnerAccess = async () => {
    try {
        const { status } = await axios.get(`.${base}/access/permission/owner`);

        if(status !== 200) {
            throw new Error('Not authorized to access owner access');
        }
    } catch (e) {
        return false;
    }

    return true;
}

export const getHrAccess = async () => {
    try {
        const { status } = await axios.get(`.${base}/access/permission/hr`);

        if(status !== 200) {
            throw new Error('Not authorized to access hr access');
        }
    } catch (e) {
        return false;
    }

    return true;
}

export const getHrAddress = async () => {
    const { data } = await axios.get(`.${base}/access/address/hr`);
    return data;
}

export const getEmployeeAddresses = async () => {
    const { data } = await axios.get(`.${base}/access/address/employees`);
    return data;
}

export const postHrAddress = async (address) => {
    await axios.post(`.${base}/access/address/hr`, {
        address: address
    });
}

export const postEmployeeAddresses = async (addresses) => {
    await axios.post(`.${base}/access/address/employees`, {
        addresses: addresses
    });
}