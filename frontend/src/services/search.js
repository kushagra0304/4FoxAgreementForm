import axios from 'axios';

export const getSearch = async (data) => {
    const res = await axios.post(`./search`, data);

    return res.data;
}