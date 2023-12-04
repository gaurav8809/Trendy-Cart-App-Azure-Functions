const fs = require('fs');
const crypto = require('crypto');

var mySQLConfig =
{
    // host: process.env["MYSQL_CONNECTION_HOST"],
    // user: process.env["MYSQL_CONNECTION_USER"],
    // password: process.env["MYSQL_CONNECTION_PASSWORD"],
    // database: process.env["MYSQL_CONNECTION_DATABASE"],
    // port: 3306,
    // ssl: {ca: fs.readFileSync("src/assets/DigiCertGlobalRootCA.crt.pem")}

    host: 'ltu-server.mysql.database.azure.com',
    user: 'ellupsidewon',
    password: 'Admin@123',
    database: 'trendy_cart',
    port: 3306,
    ssl: {ca: fs.readFileSync("src/assets/DigiCertGlobalRootCA.crt.pem")},
    // rowsAsArray: true
};
var cryptoKey = crypto.randomBytes(32);

module.exports = {
    mySQLConfig,
    cryptoKey
};