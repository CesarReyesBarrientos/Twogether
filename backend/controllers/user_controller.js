const userModel = require('../models/user_model');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await userModel.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: `Error al obtener los usuarios: ${error.message}` });
        }
    }
};

module.exports = userController;
