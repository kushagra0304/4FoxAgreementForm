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
        return await axios.get(`./oauth/checkJWT`);
    } catch (error) {
        const { response } = error

        if(response.status !== 401) {
            console.log(error);
            console.log("Error connecting to server")        
        }

        return response;
    }
}