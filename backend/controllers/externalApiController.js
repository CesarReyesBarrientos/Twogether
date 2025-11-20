import axios from 'axios';

// =============================================
// TMDB - THE MOVIE DATABASE
// =============================================

/**
 * Obtener token de acceso de Spotify
 * Spotify usa OAuth 2.0 Client Credentials
 */
const getSpotifyToken = async () => {
  try {
    const credentials = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error obteniendo token de Spotify:', error);
    throw error;
  }
};

// Variable global para cachear el token (válido por 1 hora)
let spotifyToken = null;
let spotifyTokenExpiry = null;

/**
 * Obtener token válido de Spotify (con caché)
 */
const getValidSpotifyToken = async () => {
  const now = Date.now();
  
  if (!spotifyToken || !spotifyTokenExpiry || now >= spotifyTokenExpiry) {
    spotifyToken = await getSpotifyToken();
    spotifyTokenExpiry = now + (55 * 60 * 1000); // 55 minutos
  }
  
  return spotifyToken;
};

/**
 * Buscar películas en TMDB
 */
export const searchMovies = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro "query" es requerido'
      });
    }

    const response = await axios.get(`${process.env.TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: query,
        page: page,
        language: 'es-MX'
      }
    });

    // Formatear respuesta
    const movies = response.data.results.map(movie => ({
      id_tmdb: movie.id.toString(),
      titulo: movie.title,
      titulo_original: movie.original_title,
      descripcion: movie.overview,
      poster_path: movie.poster_path 
        ? `${process.env.TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null,
      fecha_lanzamiento: movie.release_date,
      popularidad: movie.popularity,
      calificacion: movie.vote_average,
      generos_ids: movie.genre_ids
    }));

    return res.status(200).json({
      success: true,
      data: {
        movies,
        page: response.data.page,
        total_pages: response.data.total_pages,
        total_results: response.data.total_results
      }
    });

  } catch (error) {
    console.error('Error en searchMovies:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al buscar películas en TMDB',
      error: error.response?.data?.status_message || error.message
    });
  }
};

/**
 * Obtener detalles de una película específica
 */
export const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${process.env.TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'es-MX',
        append_to_response: 'credits'
      }
    });

    const movie = response.data;

    // Obtener director
    const director = movie.credits?.crew?.find(
      person => person.job === 'Director'
    );

    const formattedMovie = {
      id_tmdb: movie.id.toString(),
      titulo: movie.title,
      titulo_original: movie.original_title,
      descripcion: movie.overview,
      director: director?.name || null,
      genero: movie.genres?.map(g => g.name).join(', ') || null,
      duracion: movie.runtime,
      poster_path: movie.poster_path
        ? `${process.env.TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null,
      fecha_lanzamiento: movie.release_date,
      calificacion: movie.vote_average,
      presupuesto: movie.budget,
      ingresos: movie.revenue,
      idioma_original: movie.original_language,
      productoras: movie.production_companies?.map(c => c.name) || []
    };

    return res.status(200).json({
      success: true,
      data: formattedMovie
    });

  } catch (error) {
    console.error('Error en getMovieDetails:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de película',
      error: error.response?.data?.status_message || error.message
    });
  }
};

/**
 * Obtener películas populares
 */
export const getPopularMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;

    const response = await axios.get(`${process.env.TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        page: page,
        language: 'es-MX'
      }
    });

    const movies = response.data.results.map(movie => ({
      id_tmdb: movie.id.toString(),
      titulo: movie.title,
      descripcion: movie.overview,
      poster_path: movie.poster_path 
        ? `${process.env.TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      fecha_lanzamiento: movie.release_date,
      calificacion: movie.vote_average
    }));

    return res.status(200).json({
      success: true,
      data: {
        movies,
        page: response.data.page,
        total_pages: response.data.total_pages
      }
    });

  } catch (error) {
    console.error('Error en getPopularMovies:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener películas populares',
      error: error.message
    });
  }
};

// =============================================
// SPOTIFY - MÚSICA
// =============================================

/**
 * Buscar canciones en Spotify
 */
export const searchSongs = async (req, res) => {
  try {
    const { query, limit = 20, offset = 0 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro "query" es requerido'
      });
    }

    const token = await getValidSpotifyToken();

    const response = await axios.get(`${process.env.SPOTIFY_BASE_URL}/search`, {
      params: {
        q: query,
        type: 'track',
        limit: limit,
        offset: offset,
        market: 'MX'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const songs = response.data.tracks.items.map(track => ({
      id_spotify: track.id,
      titulo: track.name,
      artista: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duracion: track.duration_ms,
      imagen: track.album.images[0]?.url || null,
      preview_url: track.preview_url,
      fecha_lanzamiento: track.album.release_date,
      popularidad: track.popularity,
      spotify_url: track.external_urls.spotify
    }));

    return res.status(200).json({
      success: true,
      data: {
        songs,
        total: response.data.tracks.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error en searchSongs:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al buscar canciones en Spotify',
      error: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Obtener detalles de una canción
 */
export const getSongDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await getValidSpotifyToken();

    const response = await axios.get(`${process.env.SPOTIFY_BASE_URL}/tracks/${id}`, {
      params: {
        market: 'MX'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const track = response.data;

    const formattedSong = {
      id_spotify: track.id,
      titulo: track.name,
      artista: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      id_album: track.album.id,
      duracion: track.duration_ms,
      imagen: track.album.images[0]?.url || null,
      preview_url: track.preview_url,
      fecha_lanzamiento: track.album.release_date,
      popularidad: track.popularity,
      numero_pista: track.track_number,
      explicito: track.explicit,
      spotify_url: track.external_urls.spotify
    };

    return res.status(200).json({
      success: true,
      data: formattedSong
    });

  } catch (error) {
    console.error('Error en getSongDetails:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de canción',
      error: error.message
    });
  }
};

/**
 * Buscar álbumes en Spotify
 */
export const searchAlbums = async (req, res) => {
  try {
    const { query, limit = 20, offset = 0 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro "query" es requerido'
      });
    }

    const token = await getValidSpotifyToken();

    const response = await axios.get(`${process.env.SPOTIFY_BASE_URL}/search`, {
      params: {
        q: query,
        type: 'album',
        limit: limit,
        offset: offset,
        market: 'MX'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const albums = response.data.albums.items.map(album => ({
      id_spotify: album.id,
      titulo: album.name,
      artista: album.artists.map(a => a.name).join(', '),
      tipo: album.album_type,
      numero_canciones: album.total_tracks,
      imagen: album.images[0]?.url || null,
      fecha_lanzamiento: album.release_date,
      spotify_url: album.external_urls.spotify
    }));

    return res.status(200).json({
      success: true,
      data: {
        albums,
        total: response.data.albums.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error en searchAlbums:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al buscar álbumes en Spotify',
      error: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Obtener detalles de un álbum
 */
export const getAlbumDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await getValidSpotifyToken();

    const response = await axios.get(`${process.env.SPOTIFY_BASE_URL}/albums/${id}`, {
      params: {
        market: 'MX'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const album = response.data;

    const formattedAlbum = {
      id_spotify: album.id,
      titulo: album.name,
      artista: album.artists.map(a => a.name).join(', '),
      genero: album.genres?.join(', ') || null,
      tipo: album.album_type,
      numero_canciones: album.total_tracks,
      imagen: album.images[0]?.url || null,
      fecha_lanzamiento: album.release_date,
      discografica: album.label,
      popularidad: album.popularity,
      spotify_url: album.external_urls.spotify,
      canciones: album.tracks.items.map(track => ({
        numero: track.track_number,
        titulo: track.name,
        duracion: track.duration_ms,
        id_spotify: track.id
      }))
    };

    return res.status(200).json({
      success: true,
      data: formattedAlbum
    });

  } catch (error) {
    console.error('Error en getAlbumDetails:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de álbum',
      error: error.message
    });
  }
};

/**
 * Obtener canciones populares - VERSIÓN SIMPLE
 */
export const getPopularSongs = async (req, res) => {
  try {
    const token = await getValidSpotifyToken();
    const { country = 'MX' } = req.query;

    // IDs de playlists oficiales
    const playlists = [
      '37i9dQZEVXbMDoHDwVN2tF', // Top 50 Global
      '37i9dQZEVXbO3qyFxbkOE1', // Top 50 México
      '37i9dQZF1DXcBWIGoYBM5M'  // Today's Top Hits
    ];

    // Intentar cada playlist hasta que una funcione
    for (const playlistId of playlists) {
      try {
        const response = await axios.get(
          `${process.env.SPOTIFY_BASE_URL}/playlists/${playlistId}/tracks`,
          {
            params: { limit: 50, market: country },
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (response.data?.items?.length > 0) {
          const songs = response.data.items
            .filter(item => item?.track?.id)
            .map(item => ({
              id_spotify: item.track.id,
              titulo: item.track.name,
              artista: item.track.artists.map(a => a.name).join(', '),
              album: item.track.album.name,
              imagen: item.track.album.images?.[0]?.url || null,
              preview_url: item.track.preview_url,
              popularidad: item.track.popularity
            }));

          return res.status(200).json({
            success: true,
            data: { songs, total: songs.length }
          });
        }
      } catch (err) {
        console.warn(`Playlist ${playlistId} falló:`, err.message);
        continue; // Intentar siguiente playlist
      }
    }

    // Si todas las playlists fallan, usar recomendaciones
    const recResponse = await axios.get(
      `${process.env.SPOTIFY_BASE_URL}/recommendations`,
      {
        params: {
          limit: 50,
          market: country,
          seed_genres: 'pop,latin,reggaeton',
          min_popularity: 70
        },
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const songs = recResponse.data.tracks.map(track => ({
      id_spotify: track.id,
      titulo: track.name,
      artista: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      imagen: track.album.images?.[0]?.url || null,
      preview_url: track.preview_url,
      popularidad: track.popularity
    }));

    return res.status(200).json({
      success: true,
      data: { songs, total: songs.length }
    });

  } catch (error) {
    console.error('Error en getPopularSongs:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener canciones populares',
      error: error.message
    });
  }
};
