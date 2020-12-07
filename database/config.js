var db = require('mysql');
var connect = db.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "bot_wa"
});

module.exports = connect;
