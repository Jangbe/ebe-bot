var db = require('mysql');
var connect = db.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "bot_wa"
});

module.exports = connect;