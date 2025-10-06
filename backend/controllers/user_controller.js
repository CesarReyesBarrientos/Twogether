const userModel = require('../models/user_model');
const bcrypt = require('bcrypt');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await userModel.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: `Error al obtener los usuarios: ${error.message}` });
        }
    },
    addUser: async (req, res) => {
        try {
            // 1.- Obtener datos del body
            const { nombre, email, fotoPerfil, password, genero } = req.body;

            // 2.- Validar datos obligatorios - para probar desde postman   
            if (!nombre || !email || !password) {
                return res.status(400).json({ error: 'FDO' });
            }

            // 3.- Validar formato de email - para probrar desde postman
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                return res.status(400).json({ error: 'FEI' });
            }

            // 4.- Verificar si el email ya existe en la base de datos
            const existingUsers = await userModel.getAllUsers();
            const emailExists = existingUsers.some(user => user.email === email);
            if (emailExists) {
                return res.status(400).json({ error: 'EEU' });
            }

            // 5.- Comprobar longitud mínima de la contraseña
            if (password.length < 8) {
                return res.status(400).json({ error: 'FCP' });
            }

            // 6.- Crear el nuevo usuario en la base de datos
            const newUser = await userModel.addUser(
                {
                    nombre,
                    email,
                    password: await bcrypt.hash(password, 10), // Hashear la contraseña antes de guardarla
                    genero: genero || null,
                    fotoPerfil: fotoPerfil || null
                }
            );
            res.status(201).json({
                success: true,
                data: newUser, // Para probar desde postman
                message: 'UCE'
            });
        } catch (error) {
            res.status(500).json({ error: `Error al agregar el usuario: ${error.message}` });
        }
    }
};

module.exports = userController;
