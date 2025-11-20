import { Router } from 'express';
import {
  // Películas
  addMovie,
  getAllMoviesFromCatalog,
  getMovies,
  markMovieAsWatched,
  deleteMovie,
  // Canciones
  addSong,
  getAllSongsFromCatalog,
  getSongs,
  updateSongStatus,
  deleteSong,
  // Álbumes
  addAlbum,
  getAllAlbumsFromCatalog,
  getAlbums,
  updateAlbumStatus,
  deleteAlbum
} from '../controllers/mediaController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// =============================================
// PELÍCULAS
// =============================================

/**
 * @route   GET /api/media/catalog/movies
 * @desc    Obtener catálogo completo de películas
 * @access  Público o Privado (según tu decisión)
 */
router.get('/catalog/movies', getAllMoviesFromCatalog);

/**
 * @route   POST /api/media/movies
 * @desc    Agregar película a la lista de la pareja
 * @access  Privado
 */
router.post('/movies', auth, addMovie);

/**
 * @route   GET /api/media/movies
 * @desc    Obtener películas de la lista de la pareja
 * @access  Privado
 */
router.get('/movies', auth, getMovies);

/**
 * @route   PUT /api/media/movies/:id/watched
 * @desc    Marcar película como vista
 * @access  Privado
 */
router.put('/movies/:id/watched', auth, markMovieAsWatched);

/**
 * @route   DELETE /api/media/movies/:id
 * @desc    Eliminar película de la lista
 * @access  Privado
 */
router.delete('/movies/:id', auth, deleteMovie);

// =============================================
// CANCIONES
// =============================================

/**
 * @route   GET /api/media/catalog/songs
 * @desc    Obtener catálogo completo de canciones
 * @access  Público o Privado
 */
router.get('/catalog/songs', getAllSongsFromCatalog);

/**
 * @route   POST /api/media/songs
 * @desc    Agregar canción a la lista de la pareja
 * @access  Privado
 */
router.post('/songs', auth, addSong);

/**
 * @route   GET /api/media/songs
 * @desc    Obtener canciones de la lista de la pareja
 * @access  Privado
 */
router.get('/songs', auth, getSongs);

/**
 * @route   PUT /api/media/songs/:id
 * @desc    Actualizar estado de canción
 * @access  Privado
 */
router.put('/songs/:id', auth, updateSongStatus);

/**
 * @route   DELETE /api/media/songs/:id
 * @desc    Eliminar canción de la lista
 * @access  Privado
 */
router.delete('/songs/:id', auth, deleteSong);

// =============================================
// ÁLBUMES
// =============================================

/**
 * @route   GET /api/media/catalog/albums
 * @desc    Obtener catálogo completo de álbumes
 * @access  Público o Privado
 */
router.get('/catalog/albums', getAllAlbumsFromCatalog);

/**
 * @route   POST /api/media/albums
 * @desc    Agregar álbum a la lista de la pareja
 * @access  Privado
 */
router.post('/albums', auth, addAlbum);

/**
 * @route   GET /api/media/albums
 * @desc    Obtener álbumes de la lista de la pareja
 * @access  Privado
 */
router.get('/albums', auth, getAlbums);

/**
 * @route   PUT /api/media/albums/:id
 * @desc    Actualizar estado de álbum
 * @access  Privado
 */
router.put('/albums/:id', auth, updateAlbumStatus);

/**
 * @route   DELETE /api/media/albums/:id
 * @desc    Eliminar álbum de la lista
 * @access  Privado
 */
router.delete('/albums/:id', auth, deleteAlbum);

export default router;