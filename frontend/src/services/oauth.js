import axios from 'axios';

let base = '';

if(import.meta.env.DEV) {
    base = '/api';
}

// No point in handling errors here.

export const getStateForOAuth = async () => {
    const { data } = await axios.get(`.${base}/oauth/stateForOAuth`);
    return data;
}

export const getRedirectURL = async () => {
    const { data } = await axios.get(`.${base}/oauth/redirect_url`);
    return data;
}

export const getCheckJWT = async () => {
    try {
        await axios.get(`.${base}/oauth/checkJWT`);
    } catch(error) {
        return false;
    }

    return true;
}

export const getLogout = async () => {
    try {
        await axios.get(`.${base}/oauth/logout`);
    } catch(error) {
        return false;
    }

    return true;
}