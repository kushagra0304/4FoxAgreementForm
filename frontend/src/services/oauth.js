import axios from 'axios';

let domain = ".";

// import.meta.env.DEV, vite provides this enviroment variable
if(import.meta.env.DEV){
    domain = `http://localhost:10000`;
}

export const getStateForOAuth = async () => {
    try {
        return await axios.get(`${domain}/oauth/stateForOAuth`);
    } catch (error) {
        console.log(error);
        console.log("Error connecting to server")
    }
}

export const getCheckJWT = async () => {
    try {
        return await axios.get(`${domain}/oauth/checkJWT`);
    } catch (error) {
        console.log(error);
        console.log("Error connecting to server")
    }
}