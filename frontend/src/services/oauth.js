import axios from 'axios';

let domain = "https://fourfoxagreementform.onrender.com";

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