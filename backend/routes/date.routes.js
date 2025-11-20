import { Router } from 'express';
import {
  createDate,
  getDates,
  getDateById,
  updateDate,
  deleteDate,
  addNote,
  getNotesFromDate,
  deleteNote,
  updateNote
} from '../controllers/dateController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// =============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// =============================================

// ============= CITAS =============

/**
 * @route   POST /api/dates
 * @desc    Crear nueva cita
 * @access  Privado
 */
router.post('/', auth, createDate);

/**
 * @route   GET /api/dates
 * @desc    Obtener todas las citas de la pareja
 * @query   ?tipo=cena&fecha_inicio=2024-01-01&fecha_fin=2024-12-31&limit=10&offset=0
 * @access  Privado
 */
router.get('/', auth, getDates);

/**
 * @route   GET /api/dates/:id
 * @desc    Obtener una cita específica con sus notas
 * @access  Privado
 */
router.get('/:id', auth, getDateById);

/**
 * @route   PUT /api/dates/:id
 * @desc    Actualizar una cita
 * @access  Privado
 */
router.put('/:id', auth, updateDate);

/**
 * @route   DELETE /api/dates/:id
 * @desc    Eliminar una cita
 * @access  Privado
 */
router.delete('/:id', auth, deleteDate);

// ============= NOTAS =============

/**
 * @route   POST /api/dates/notes
 * @desc    Agregar nota a una cita
 * @body    { cita_id, texto }
 * @access  Privado
 */
router.post('/notes', auth, addNote);

/**
 * @route   GET /api/dates/:cita_id/notes
 * @desc    Obtener todas las notas de una cita
 * @access  Privado
 */
router.get('/:cita_id/notes', auth, getNotesFromDate);

/**
 * @route   PUT /api/dates/notes/:id
 * @desc    Actualizar una nota (solo el creador)
 * @access  Privado
 */
router.put('/notes/:id', auth, updateNote);

/**
 * @route   DELETE /api/dates/notes/:id
 * @desc    Eliminar una nota (solo el creador)
 * @access  Privado
 */
router.delete('/notes/:id', auth, deleteNote);

export default router;