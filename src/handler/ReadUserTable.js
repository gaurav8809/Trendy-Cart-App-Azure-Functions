const mysql = require('mysql2');

const { mySQLConfig } = require('../assets/configs');

function readData(){

    const conn = new mysql.createConnection(mySQLConfig);

    conn.connect(err => { 
            if (err) { 
                console.log("!!! Cannot connect !!! Error:");
                throw err;
            }
            else {
                console.log("Connection established.");
                conn.query('SELECT * FROM user', 
                    function (err, results, fields) {
                        if (err) throw err;
                        else console.log('Selected ' + results.length + ' row(s).');
                        for (i = 0; i < results.length; i++) {
                            console.log('Row: ' + JSON.stringify(results[i]));
                        }
                        console.log('Done.');
                    })
                conn.end(
                    function (err) { 
                        if (err) throw err;
                        else  console.log('Closing connection.') 
                });
            }
        });
};

module.exports = {
    readData
};