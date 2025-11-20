import { Router } from 'express';
import {
  // TMDB - Películas
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  // Spotify - Música
  searchSongs,
  getSongDetails,
  searchAlbums,
  getAlbumDetails,
  getPopularSongs
} from '../controllers/externalApiController.js';

const router = Router();

// =============================================
// TMDB - PELÍCULAS
// =============================================

/**
 * @route   GET /api/external/movies/search
 * @desc    Buscar películas en TMDB
 * @query   query (requerido), page
 * @access  Público
 */
router.get('/movies/search', searchMovies);

/**
 * @route   GET /api/external/movies/popular
 * @desc    Obtener películas populares
 * @query   page
 * @access  Público
 */
router.get('/movies/popular', getPopularMovies);

/**
 * @route   GET /api/external/movies/:id
 * @desc    Obtener detalles de una película
 * @param   id - ID de TMDB
 * @access  Público
 */
router.get('/movies/:id', getMovieDetails);

// =============================================
// SPOTIFY - CANCIONES
// =============================================

/**
 * @route   GET /api/external/songs/search
 * @desc    Buscar canciones en Spotify
 * @query   query (requerido), limit, offset
 * @access  Público
 */
router.get('/songs/search', searchSongs);

/**
 * @route   GET /api/external/songs/popular
 * @desc    Obtener canciones populares (Top 50 Global)
 * @access  Público
 */
router.get('/songs/popular', getPopularSongs);

/**
 * @route   GET /api/external/songs/:id
 * @desc    Obtener detalles de una canción
 * @param   id - ID de Spotify
 * @access  Público
 */
router.get('/songs/:id', getSongDetails);

// =============================================
// SPOTIFY - ÁLBUMES
// =============================================

/**
 * @route   GET /api/external/albums/search
 * @desc    Buscar álbumes en Spotify
 * @query   query (requerido), limit, offset
 * @access  Público
 */
router.get('/albums/search', searchAlbums);

/**
 * @route   GET /api/external/albums/:id
 * @desc    Obtener detalles de un álbum
 * @param   id - ID de Spotify
 * @access  Público
 */
router.get('/albums/:id', getAlbumDetails);

export default router;