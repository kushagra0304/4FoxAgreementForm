import axios from 'axios';

let base = '';

if(import.meta.env.DEV) {
    base = '/api';
}

export const getSearch = async (data) => {
    const res = await axios.post(`.${base}/search`, data);

    return res.data;
}