const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
// movieController and other controllers would be similarly imported

//Rutas para Usuarios
router.get('/getAllUsers', userController.getAllUsers); // Obtener todos los usuarios
router.post('/addUser', userController.addUser); // Agregar un nuevo usuario

module.exports = router;