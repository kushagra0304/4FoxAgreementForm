const config = require('./utils/config.js');
const app = require('./app.js');

app.listen(config.PORT, () => {
    console.log(`Example app listening on port ${config.PORT}!`)
});