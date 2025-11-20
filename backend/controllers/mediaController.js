import { Pelicula, Album, Cancion, ListaPelicula, ListaCancion, ListaAlbum, Pareja } from '../models/index.js';
import { Op } from 'sequelize';

// =============================================
// HELPER: OBTENER PAREJA DEL USUARIO
// =============================================
const obtenerParejaDelUsuario = async (usuarioId) => {
  const pareja = await Pareja.findOne({
    where: {
      [Op.or]: [
        { id_usuario1: usuarioId },
        { id_usuario2: usuarioId }
      ],
      id_usuario2: { [Op.not]: null }
    }
  });
  return pareja;
};

// =============================================
// 1. PELÍCULAS - CATÁLOGO Y LISTAS
// =============================================

/**
 * Agregar película a la lista de la pareja
 * - Si la película no existe en el catálogo, la crea
 * - Luego la agrega a la lista de la pareja
 */
export const addMovie = async (req, res) => {
  try {
    const { id_tmdb, titulo, director, genero, duracion, poster_path, fecha_lanzamiento, estado } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (!id_tmdb || !titulo) {
      return res.status(400).json({
        success: false,
        message: 'El ID de TMDB y el título son requeridos'
      });
    }

    // Obtener pareja del usuario
    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // 1. Buscar o crear la película en el catálogo
    let pelicula = await Pelicula.findOne({ where: { id_tmdb } });
    
    if (!pelicula) {
      // La película no existe en nuestro catálogo, la creamos
      pelicula = await Pelicula.create({
        id_tmdb,
        titulo,
        director: director || null,
        genero: genero || null,
        duracion: duracion || null,
        poster_path: poster_path || null,
        fecha_lanzamiento: fecha_lanzamiento || null
      });
    }

    // 2. Verificar si la película ya está en la lista de la pareja
    const yaEnLista = await ListaPelicula.findOne({
      where: {
        id_pareja: pareja.id_pareja,
        id_pelicula: pelicula.id_pelicula
      }
    });

    if (yaEnLista) {
      return res.status(409).json({
        success: false,
        message: 'Esta película ya está en tu lista'
      });
    }

    // 3. Agregar película a la lista de la pareja
    const listaPelicula = await ListaPelicula.create({
      id_pareja: pareja.id_pareja,
      id_pelicula: pelicula.id_pelicula,
      estado: estado || 'pendiente',
      fecha_agregado: new Date()
    });

    // 4. Obtener el registro completo con la información de la película
    const resultado = await ListaPelicula.findByPk(listaPelicula.id_lista, {
      include: [
        {
          model: Pelicula,
          as: 'pelicula'
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Película agregada exitosamente a tu lista',
      data: resultado
    });

  } catch (error) {
    console.error('Error en addMovie:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Esta película ya está en tu lista'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al agregar película',
      error: error.message
    });
  }
};

/**
 * Obtener todas las películas del catálogo
 * (Para mostrar al usuario antes de agregar a su lista)
 */
export const getAllMoviesFromCatalog = async (req, res) => {
  try {
    const { search, genero, limit, offset } = req.query;

    // Construir filtros
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${search}%` } },
        { director: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (genero) {
      where.genero = { [Op.like]: `%${genero}%` };
    }

    const peliculas = await Pelicula.findAll({
      where,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      order: [['titulo', 'ASC']]
    });

    const total = await Pelicula.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        peliculas,
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    });

  } catch (error) {
    console.error('Error en getAllMoviesFromCatalog:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener catálogo de películas',
      error: error.message
    });
  }
};

/**
 * Obtener películas de la lista de la pareja
 */
export const getMovies = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { estado, limit, offset } = req.query;

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // Construir filtros
    const where = { id_pareja: pareja.id_pareja };
    if (estado) {
      where.estado = estado;
    }

    const peliculas = await ListaPelicula.findAll({
      where,
      include: [
        {
          model: Pelicula,
          as: 'pelicula'
        }
      ],
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      order: [['fecha_agregado', 'DESC']]
    });

    const total = await ListaPelicula.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        peliculas,
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    });

  } catch (error) {
    console.error('Error en getMovies:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener películas',
      error: error.message
    });
  }
};

/**
 * Marcar película como vista
 */
export const markMovieAsWatched = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    const listaPelicula = await ListaPelicula.findOne({
      where: {
        id_lista: id,
        id_pareja: pareja.id_pareja
      },
      include: [
        {
          model: Pelicula,
          as: 'pelicula'
        }
      ]
    });

    if (!listaPelicula) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada en tu lista'
      });
    }

    listaPelicula.estado = 'vista';
    await listaPelicula.save();

    return res.status(200).json({
      success: true,
      message: 'Película marcada como vista',
      data: listaPelicula
    });

  } catch (error) {
    console.error('Error en markMovieAsWatched:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar película',
      error: error.message
    });
  }
};

/**
 * Eliminar película de la lista
 */
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    const listaPelicula = await ListaPelicula.findOne({
      where: {
        id_lista: id,
        id_pareja: pareja.id_pareja
      }
    });

    if (!listaPelicula) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada en tu lista'
      });
    }

    await listaPelicula.destroy();

    return res.status(200).json({
      success: true,
      message: 'Película eliminada de tu lista exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteMovie:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar película',
      error: error.message
    });
  }
};

// =============================================
// 2. CANCIONES - CATÁLOGO Y LISTAS
// =============================================

/**
 * Agregar canción a la lista de la pareja
 */
export const addSong = async (req, res) => {
  try {
    const { id_spotify, titulo, artista, genero, duracion, imagen, id_album, estado } = req.body;
    const usuarioId = req.usuario.id;

    if (!id_spotify || !titulo || !artista) {
      return res.status(400).json({
        success: false,
        message: 'El ID de Spotify, título y artista son requeridos'
      });
    }

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // 1. Buscar o crear la canción en el catálogo
    let cancion = await Cancion.findOne({ where: { id_spotify } });
    
    if (!cancion) {
      cancion = await Cancion.create({
        id_spotify,
        titulo,
        artista,
        genero: genero || null,
        duracion: duracion || null,
        imagen: imagen || null,
        id_album: id_album || null
      });
    }

    // 2. Verificar si ya está en la lista
    const yaEnLista = await ListaCancion.findOne({
      where: {
        id_pareja: pareja.id_pareja,
        id_cancion: cancion.id_cancion
      }
    });

    if (yaEnLista) {
      return res.status(409).json({
        success: false,
        message: 'Esta canción ya está en tu lista'
      });
    }

    // 3. Agregar a la lista
    const listaCancion = await ListaCancion.create({
      id_pareja: pareja.id_pareja,
      id_cancion: cancion.id_cancion,
      estado: estado || 'guardada',
      fecha_agregado: new Date()
    });

    // 4. Obtener resultado completo
    const resultado = await ListaCancion.findByPk(listaCancion.id_lista, {
      include: [
        {
          model: Cancion,
          as: 'cancion',
          include: [
            {
              model: Album,
              as: 'album'
            }
          ]
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Canción agregada exitosamente a tu lista',
      data: resultado
    });

  } catch (error) {
    console.error('Error en addSong:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Esta canción ya está en tu lista'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al agregar canción',
      error: error.message
    });
  }
};

/**
 * Obtener todas las canciones del catálogo
 */
export const getAllSongsFromCatalog = async (req, res) => {
  try {
    const { search, artista, limit, offset } = req.query;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${search}%` } },
        { artista: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (artista) {
      where.artista = { [Op.like]: `%${artista}%` };
    }

    const canciones = await Cancion.findAll({
      where,
      include: [
        {
          model: Album,
          as: 'album'
        }
      ],
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      order: [['titulo', 'ASC']]
    });

    const total = await Cancion.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        canciones,
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    });

  } catch (error) {
    console.error('Error en getAllSongsFromCatalog:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener catálogo de canciones',
      error: error.message
    });
  }
};

/**
 * Obtener canciones de la lista de la pareja
 */
export const getSongs = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { estado, limit, offset } = req.query;

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    const where = { id_pareja: pareja.id_pareja };
    if (estado) {
      where.estado = estado;
    }

    const canciones = await ListaCancion.findAll({
      where,
      include: [
        {
          model: Cancion,
          as: 'cancion',
          include: [
            {
              model: Album,
              as: 'album'
            }
          ]
        }
      ],
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      order: [['fecha_agregado', 'DESC']]
    });

    const total = await ListaCancion.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        canciones,
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    });

  } catch (error) {
    console.error('Error en getSongs:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener canciones',
      error: error.message
    });
  }
};

/**
 * Actualizar estado de canción
 */
export const updateSongStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const usuarioId = req.usuario.id;

    if (!estado || !['favorita', 'guardada'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser "favorita" o "guardada"'
      });
    }

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    const listaCancion = await ListaCancion.findOne({
      where: {
        id_lista: id,
        id_pareja: pareja.id_pareja
      },
      include: [
        {
          model: Cancion,
          as: 'cancion'
        }
      ]
    });

    if (!listaCancion) {
      return res.status(404).json({
        success: false,
        message: 'Canción no encontrada en tu lista'
      });
    }

    listaCancion.estado = estado;
    await listaCancion.save();

    return res.status(200).json({
      success: true,
      message: 'Estado de canción actualizado',
      data: listaCancion
    });

  } catch (error) {
    console.error('Error en updateSongStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar canción',
      error: error.message
    });
  }
};

/**
 * Eliminar canción de la lista
 */
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    const listaCancion = await ListaCancion.findOne({
      where: {
        id_lista: id,
        id_pareja: pareja.id_pareja
      }
    });

    if (!listaCancion) {
      return res.status(404).json({
        success: false,
        message: 'Canción no encontrada en tu lista'
      });
    }

    await listaCancion.destroy();

    return res.status(200).json({
      success: true,
      message: 'Canción eliminada de tu lista exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteSong:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar canción',
      error: error.message
    });
  }
};

// =============================================
// 3. ÁLBUMES - CATÁLOGO Y LISTAS
// =============================================

/**
 * Agregar álbum a la lista de la pareja
 */
export const addAlbum = async (req, res) => {
  try {
    const { id_spotify, titulo, artista, genero, numero_canciones, imagen, fecha_lanzamiento, estado } = req.body;
    const usuarioId = req.usuario.id;

    if (!id_spotify || !titulo || !artista) {
      return res.status(400).json({
        success: false,
        message: 'El ID de Spotify, título y artista son requeridos'
      });
    }

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // 1. Buscar o crear el álbum en el catálogo
    let album = await Album.findOne({ where: { id_spotify } });
    
    if (!album) {
      album = await Album.create({
        id_spotify,
        titulo,
        artista,
        genero: genero || null,
        numero_canciones: numero_canciones || null,
        imagen: imagen || null,
        fecha_lanzamiento: fecha_lanzamiento || null
      });
    }

    // 2. Verificar si ya está en la lista
    const yaEnLista = await ListaAlbum.findOne({
      where: {
        id_pareja: pareja.id_pareja,
        id_album: album.id_album
      }
    });

    if (yaEnLista) {
      return res.status(409).json({
        success: false,
        message: 'Este álbum ya está en tu lista'
      });
    }

    // 3. Agregar a la lista
    const listaAlbum = await ListaAlbum.create({
      id_pareja: pareja.id_pareja,
      id_album: album.id_album,
      estado: estado || 'pendiente',
      fecha_agregado: new Date()
    });

    // 4. Obtener resultado completo
    const resultado = await ListaAlbum.findByPk(listaAlbum.id_lista, {
      include: [
        {
          model: Album,
          as: 'album'
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Álbum agregado exitosamente a tu lista',
      data: resultado
    });

  } catch (error) {
    console.error('Error en addAlbum:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Este álbum ya está en tu lista'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al agregar álbum',
      error: error.message
    });
  }
};

/**
 * Obtener todos los álbumes del catálogo
 */
export const getAllAlbumsFromCatalog = async (req, res) => {
  try {
    const { search, artista, limit, offset } = req.query;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${search}%` } },
        { artista: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (artista) {
      where.artista = { [Op.like]: `%${artista}%` };
    }

    const albumes = await Album.findAll({
      where,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      order: [['titulo', 'ASC']]
    });

    const total = await Album.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        albumes,
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    });

  } catch (error) {
    console.error('Error en getAllAlbumsFromCatalog:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener catálogo de álbumes',
      error: error.message
    });
  }
};

/**
 * Obtener álbumes de la lista de la pareja
 */
export const getAlbums = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { estado, limit, offset } = req.query;

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    const where = { id_pareja: pareja.id_pareja };
    if (estado) {
      where.estado = estado;
    }

    const albumes = await ListaAlbum.findAll({
      where,
      include: [
        {
          model: Album,
          as: 'album'
        }
      ],
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      order: [['fecha_agregado', 'DESC']]
    });

    const total = await ListaAlbum.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        albumes,
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    });

  } catch (error) {
    console.error('Error en getAlbums:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener álbumes',
      error: error.message
    });
  }
};

/**
 * Actualizar estado de álbum
 */
export const updateAlbumStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const usuarioId = req.usuario.id;

    if (!estado || !['escuchado', 'pendiente'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser "escuchado" o "pendiente"'
      });
    }

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    const listaAlbum = await ListaAlbum.findOne({
      where: {
        id_lista: id,
        id_pareja: pareja.id_pareja
      },
      include: [
        {
          model: Album,
          as: 'album'
        }
      ]
    });

    if (!listaAlbum) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado en tu lista'
      });
    }

    listaAlbum.estado = estado;
    await listaAlbum.save();

    return res.status(200).json({
      success: true,
      message: 'Estado de álbum actualizado',
      data: listaAlbum
    });

  } catch (error) {
    console.error('Error en updateAlbumStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar álbum',
      error: error.message
    });
  }
};

/**
 * Eliminar álbum de la lista
 */
export const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    const listaAlbum = await ListaAlbum.findOne({
      where: {
        id_lista: id,
        id_pareja: pareja.id_pareja
      }
    });

    if (!listaAlbum) {
      return res.status(404).json({
        success: false,
        message: 'Álbum no encontrado en tu lista'
      });
    }

    await listaAlbum.destroy();

    return res.status(200).json({
      success: true,
      message: 'Álbum eliminado de tu lista exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteAlbum:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar álbum',
      error: error.message
    });
  }
};