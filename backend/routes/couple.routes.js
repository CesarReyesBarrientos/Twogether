import { Router } from 'express';
import {
  vincular,
  desvincular,
  getCode,
  regenerarCodigo,
  getParejaInfo
} from '../controllers/coupleController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// =============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// =============================================

/**
 * @route   POST /api/couple/vincular
 * @desc    Vincular usuario con una pareja usando código
 * @access  Privado
 */
router.post('/vincular', auth, vincular);

/**
 * @route   POST /api/couple/desvincular
 * @desc    Desvincular de la pareja actual
 * @access  Privado
 */
router.post('/desvincular', auth, desvincular);

/**
 * @route   GET /api/couple/code
 * @desc    Obtener código de vinculación
 * @access  Privado
 */
router.get('/code', auth, getCode);

/**
 * @route   PUT /api/couple/code/regenerar
 * @desc    Regenerar código de vinculación
 * @access  Privado
 */
router.put('/code/regenerar', auth, regenerarCodigo);

/**
 * @route   GET /api/couple/info
 * @desc    Obtener información de la pareja
 * @access  Privado
 */
router.get('/info', auth, getParejaInfo);

export default router;