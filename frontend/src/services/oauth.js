import axios from 'axios';

let domain;

// import.meta.env.DEV, vite provides this enviroment variable
if(import.meta.env.DEV){
    domain = `localhost:10000`;
}

export const getStateForOAuth = async () => {
    try {
        return await axios.get(`http://${domain}/oauth/stateForOAuth`);
    } catch (error) {
        console.log(error);
        console.log("Error connecting to server")
    }
}