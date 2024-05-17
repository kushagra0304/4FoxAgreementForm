const config = require('./config');

const debug = (text) => {
    if(config.ENVIROMENT === "development" || config.ENVIROMENT === "debug") {
        console.info(text);
    }
}

module.exports = {
    debug
}