const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
// movieController and other controllers would be similarly imported

//Rutas para Usuarios
router.get('/getAllUsers', userController.getAllUsers); // Obtener todos los usuarios

module.exports = router;