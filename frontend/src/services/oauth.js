import axios from 'axios';

// No point in handling errors here.

export const getStateForOAuth = async () => {
    const { data } = await axios.get(`./oauth/stateForOAuth`);
    return data;
}

export const getRedirectURL = async () => {
    const { data } = await axios.get(`./oauth/redirect_url`);
    return data;
}

export const getCheckJWT = async () => {
    await axios.get(`./oauth/checkJWT`);
}