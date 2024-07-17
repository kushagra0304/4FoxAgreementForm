import axios from 'axios';

let base = '';

if(import.meta.env.DEV) {
    base = '/api';
}

// No point in handling errors here.

export const getAddress = async () => {
    const { data } = await axios.get(`.${base}/address`);
    return data;
}