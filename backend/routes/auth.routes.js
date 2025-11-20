import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// =============================================
// RUTAS PÚBLICAS (Sin autenticación)
// =============================================

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Público
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Público
 */
router.post('/login', login);

// =============================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// =============================================

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Privado
 */
router.get('/profile', auth, getProfile);

export default router;