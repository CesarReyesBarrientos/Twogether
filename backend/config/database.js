const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});

const checkConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Conexión exitosa con la base de datos.");
        connection.release();
    } catch (error) {
        console.log("Error al conectar con la base de datos");
        process.exit(1);
    }
};

module.exports = {
    pool,
    checkConnection
};