import { Cita, Nota, Pareja, Usuario } from '../models/index.js';
import { Op } from 'sequelize';

// =============================================
// CREAR CITA
// =============================================
export const createDate = async (req, res) => {
  try {
    const { titulo, descripcion, fecha, tipo } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (!titulo || !fecha) {
      return res.status(400).json({
        success: false,
        message: 'Título y fecha son requeridos'
      });
    }

    // Validar que la fecha sea válida
    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha inválida'
      });
    }

    // Obtener pareja del usuario
    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada para crear citas'
      });
    }

    // Crear la cita
    const nuevaCita = await Cita.create({
      titulo,
      descripcion: descripcion || null,
      fecha: fechaDate,
      tipo: tipo || 'otro',
      pareja_id: pareja.id
    });

    return res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: nuevaCita
    });

  } catch (error) {
    console.error('Error en createDate:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al crear cita',
      error: error.message
    });
  }
};

// =============================================
// OBTENER TODAS LAS CITAS
// =============================================
export const getDates = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { tipo, fecha_inicio, fecha_fin, limit, offset } = req.query;

    // Obtener pareja del usuario
    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // Construir filtros
    const where = { pareja_id: pareja.id };

    // Filtrar por tipo si se proporciona
    if (tipo && ['paseo', 'cena', 'pelicula', 'viaje', 'aniversario', 'otro'].includes(tipo)) {
      where.tipo = tipo;
    }

    // Filtrar por rango de fechas
    if (fecha_inicio || fecha_fin) {
      where.fecha = {};
      if (fecha_inicio) {
        where.fecha[Op.gte] = new Date(fecha_inicio);
      }
      if (fecha_fin) {
        where.fecha[Op.lte] = new Date(fecha_fin);
      }
    }

    // Opciones de consulta
    const options = {
      where,
      include: [
        {
          model: Nota,
          as: 'notas',
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['id', 'nombre', 'foto_perfil']
            }
          ]
        }
      ],
      order: [
        ['fecha', 'DESC'],
        [{ model: Nota, as: 'notas' }, 'created_at', 'DESC']
      ],
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };

    const citas = await Cita.findAll(options);
    const total = await Cita.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        citas,
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    });

  } catch (error) {
    console.error('Error en getDates:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      error: error.message
    });
  }
};

// =============================================
// OBTENER UNA CITA POR ID
// =============================================
export const getDateById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Obtener pareja del usuario
    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // Buscar la cita
    const cita = await Cita.findOne({
      where: {
        id,
        pareja_id: pareja.id
      },
      include: [
        {
          model: Nota,
          as: 'notas',
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['id', 'nombre', 'foto_perfil']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      data: cita
    });

  } catch (error) {
    console.error('Error en getDateById:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener cita',
      error: error.message
    });
  }
};

// =============================================
// ACTUALIZAR CITA
// =============================================
export const updateDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, tipo } = req.body;
    const usuarioId = req.usuario.id;

    // Obtener pareja del usuario
    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // Buscar la cita
    const cita = await Cita.findOne({
      where: {
        id,
        pareja_id: pareja.id
      }
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Actualizar campos proporcionados
    if (titulo) cita.titulo = titulo;
    if (descripcion !== undefined) cita.descripcion = descripcion;
    if (fecha) {
      const fechaDate = new Date(fecha);
      if (isNaN(fechaDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fecha inválida'
        });
      }
      cita.fecha = fechaDate;
    }
    if (tipo) cita.tipo = tipo;

    await cita.save();

    return res.status(200).json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: cita
    });

  } catch (error) {
    console.error('Error en updateDate:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar cita',
      error: error.message
    });
  }
};

// =============================================
// ELIMINAR CITA
// =============================================
export const deleteDate = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Obtener pareja del usuario
    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // Buscar la cita
    const cita = await Cita.findOne({
      where: {
        id,
        pareja_id: pareja.id
      }
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    await cita.destroy();

    return res.status(200).json({
      success: true,
      message: 'Cita eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteDate:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar cita',
      error: error.message
    });
  }
};

// =============================================
// AGREGAR NOTA A UNA CITA
// =============================================
export const addNote = async (req, res) => {
  try {
    const { cita_id, texto } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (!cita_id || !texto) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la cita y el texto son requeridos'
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

    // Verificar que la cita exista y pertenezca a la pareja
    const cita = await Cita.findOne({
      where: {
        id: cita_id,
        pareja_id: pareja.id
      }
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Crear la nota
    const nuevaNota = await Nota.create({
      texto,
      cita_id,
      usuario_id: usuarioId
    });

    // Obtener la nota con información del usuario
    const notaCompleta = await Nota.findByPk(nuevaNota.id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'foto_perfil']
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Nota agregada exitosamente',
      data: notaCompleta
    });

  } catch (error) {
    console.error('Error en addNote:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al agregar nota',
      error: error.message
    });
  }
};

// =============================================
// OBTENER NOTAS DE UNA CITA
// =============================================
export const getNotesFromDate = async (req, res) => {
  try {
    const { cita_id } = req.params;
    const usuarioId = req.usuario.id;

    // Obtener pareja del usuario
    const pareja = await obtenerParejaDelUsuario(usuarioId);
    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // Verificar que la cita exista y pertenezca a la pareja
    const cita = await Cita.findOne({
      where: {
        id: cita_id,
        pareja_id: pareja.id
      }
    });

    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Obtener las notas
    const notas = await Nota.findAll({
      where: { cita_id },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'foto_perfil']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: {
        notas,
        total: notas.length
      }
    });

  } catch (error) {
    console.error('Error en getNotesFromDate:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener notas',
      error: error.message
    });
  }
};

// =============================================
// ELIMINAR NOTA
// =============================================
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Buscar la nota
    const nota = await Nota.findByPk(id);

    if (!nota) {
      return res.status(404).json({
        success: false,
        message: 'Nota no encontrada'
      });
    }

    // Verificar que la nota pertenezca al usuario
    if (nota.usuario_id !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta nota'
      });
    }

    await nota.destroy();

    return res.status(200).json({
      success: true,
      message: 'Nota eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteNote:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar nota',
      error: error.message
    });
  }
};

// =============================================
// ACTUALIZAR NOTA
// =============================================
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;
    const usuarioId = req.usuario.id;

    if (!texto) {
      return res.status(400).json({
        success: false,
        message: 'El texto es requerido'
      });
    }

    // Buscar la nota
    const nota = await Nota.findByPk(id);

    if (!nota) {
      return res.status(404).json({
        success: false,
        message: 'Nota no encontrada'
      });
    }

    // Verificar que la nota pertenezca al usuario
    if (nota.usuario_id !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta nota'
      });
    }

    nota.texto = texto;
    await nota.save();

    // Obtener la nota actualizada con información del usuario
    const notaActualizada = await Nota.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'foto_perfil']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Nota actualizada exitosamente',
      data: notaActualizada
    });

  } catch (error) {
    console.error('Error en updateNote:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar nota',
      error: error.message
    });
  }
};

// =============================================
// FUNCIÓN AUXILIAR: OBTENER PAREJA DEL USUARIO
// =============================================
const obtenerParejaDelUsuario = async (usuarioId) => {
  const pareja = await Pareja.findOne({
    where: {
      [Op.or]: [
        { usuario1_id: usuarioId },
        { usuario2_id: usuarioId }
      ],
      usuario2_id: { [Op.not]: null } // Solo parejas completas
    }
  });
  return pareja;
};