import axios from 'axios';

// No point in handling errors here.

export const getAddress = async () => {
    const { data } = await axios.get(`./address`);
    return data;
}