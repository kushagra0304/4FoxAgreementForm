const config = require('./config');

const debug = (...text) => {
    if(config.ENVIROMENT === "development" || config.ENVIROMENT === "debug") {
        console.info(...text);
    }
}

const measureRequestTime = (req, res, next) => {
    const startTime = Date.now();
  
    // Event listener for response finish
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`${req.method} ${req.originalUrl} took ${duration}ms`);
    });
  
    next();
}

module.exports = {
    debug,
    measureRequestTime
}