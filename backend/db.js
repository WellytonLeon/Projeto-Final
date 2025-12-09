const mysql = require("mysql2");
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password, 
    database: process.env.database
});

connection.connect((err) => {
    if (err) {
            console.log(process.env.host);
        console.error("Erro ao conectar ao MySQL:", err);
        return;
    }

    console.log("Conectado ao MySQL!");
});

module.exports = connection;
