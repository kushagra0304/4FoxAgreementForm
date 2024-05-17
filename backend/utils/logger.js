const config = require('./config');

const debug = (text) => {
    if(config.ENVIROMENT !== "development") {
        return;
    }

    console.info(text);
}

module.exports = {
    debug
}