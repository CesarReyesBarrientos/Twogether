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
    
    // Agregar un nuevo usuario a la tabla Usuario
    addUser: async (userData) => {
        const { nombre, email, password, genero, fotoPerfil } = userData;

        // Realizar el Query de inserción
        const query = `
        INSERT INTO usuario (nombre, email, password, genero, foto_perfil, fecha_registro) 
        VALUES (?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await db.connection.execute(query, [nombre, email, password, genero, fotoPerfil]);
        return result;
    },

    // TODAS LAS FUNCIONES POSIBLES SOBRE LA TABLA USUARIO
};

module.exports = userModel;