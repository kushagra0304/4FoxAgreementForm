import axios from 'axios';

export const getStateForOAuth = async () => {
    try {
        return await axios.get(`./oauth/stateForOAuth`);
    } catch (error) {
        console.log(error);
        console.log("Error connecting to server")
    }
}

export const getCheckJWT = async () => {
    try {
        const res = await axios.get(`./oauth/checkJWT`);

        if(res.status !== 200) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}