// Queries DIRECTAMENTE a la base de datos
const db = require('../config/database');

// Definición del modelo de usuario (TODAS LAS FUNCIONES QUE SE VAN A REALIZAR SOBRE LA TABLA USUARIO)
const userModel = {
    // Obtener todos los usuarios dentro de la tabla Usuario
    getAllUsers: async () => {
        const query = 'SELECT * FROM usuario';
        const [rows] = await db.connection.execute(query);
        return rows;
    },

    // TODAS LAS FUNCIONES POSIBLES SOBRE LA TABLA USUARIO
};

module.exports = userModel;