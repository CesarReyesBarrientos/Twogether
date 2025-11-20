import { Usuario, Pareja } from '../models/index.js';
import { Op } from 'sequelize';

// =============================================
// VINCULAR USUARIO CON PAREJA
// =============================================
export const vincular = async (req, res) => {
  try {
    const { codigo_vinculacion } = req.body;
    const usuarioId = req.usuario.id; // Del middleware de autenticación

    // Validar que venga el código
    if (!codigo_vinculacion) {
      return res.status(400).json({
        success: false,
        message: 'El código de vinculación es requerido'
      });
    }

    // Buscar la pareja que creó ese código
    const pareja = await Pareja.findOne({
      where: { codigo_vinculacion },
      include: [
        { model: Usuario, as: 'usuario1', attributes: ['id', 'nombre', 'email', 'foto_perfil'] },
        { model: Usuario, as: 'usuario2', attributes: ['id', 'nombre', 'email', 'foto_perfil'] }
      ]
    });

    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'Código de vinculación inválido'
      });
    }

    // Verificar que la pareja no esté completa
    if (pareja.usuario2_id !== null) {
      return res.status(400).json({
        success: false,
        message: 'Esta pareja ya está completa'
      });
    }

    // Verificar que el usuario no se vincule consigo mismo
    if (pareja.usuario1_id === usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes vincularte con tu propio código'
      });
    }

    // Verificar si el usuario ya tiene una pareja
    const parejaExistente = await Pareja.findOne({
      where: {
        [Op.or]: [
          { usuario1_id: usuarioId },
          { usuario2_id: usuarioId }
        ]
      }
    });

    if (parejaExistente && parejaExistente.usuario2_id !== null) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás vinculado con otra pareja'
      });
    }

    // Si el usuario tenía una pareja incompleta, eliminarla
    if (parejaExistente && parejaExistente.usuario1_id === usuarioId) {
      await parejaExistente.destroy();
    }

    // Vincular al usuario2
    pareja.usuario2_id = usuarioId;
    pareja.fecha_union = new Date();
    await pareja.save();

    // Obtener la pareja actualizada con todos los datos
    const parejaActualizada = await Pareja.findByPk(pareja.id, {
      include: [
        { model: Usuario, as: 'usuario1', attributes: ['id', 'nombre', 'email', 'foto_perfil'] },
        { model: Usuario, as: 'usuario2', attributes: ['id', 'nombre', 'email', 'foto_perfil'] }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Vinculación exitosa',
      data: {
        pareja: parejaActualizada
      }
    });

  } catch (error) {
    console.error('Error en vincular:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al vincular pareja',
      error: error.message
    });
  }
};

// =============================================
// DESVINCULAR PAREJA
// =============================================
export const desvincular = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Buscar la pareja del usuario
    const pareja = await Pareja.findOne({
      where: {
        [Op.or]: [
          { usuario1_id: usuarioId },
          { usuario2_id: usuarioId }
        ]
      }
    });

    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja vinculada'
      });
    }

    // Verificar que la pareja esté completa
    if (pareja.usuario2_id === null) {
      return res.status(400).json({
        success: false,
        message: 'No hay una pareja vinculada para desvincular'
      });
    }

    // Determinar quién inicia la desvinculación
    const esUsuario1 = pareja.usuario1_id === usuarioId;
    const otroUsuarioId = esUsuario1 ? pareja.usuario2_id : pareja.usuario1_id;

    // Opción 1: Soft delete - Nullify usuario2 y generar nuevo código
    if (esUsuario1) {
      // Si es usuario1, mantener la pareja pero quitar usuario2
      pareja.usuario2_id = null;
      pareja.codigo_vinculacion = generarCodigoUnico();
      await pareja.save();
    } else {
      // Si es usuario2, simplemente quitarlo
      pareja.usuario2_id = null;
      await pareja.save();
      
      // Crear nueva pareja para el usuario que se desvincula
      const nuevoCodigo = generarCodigoUnico();
      await Pareja.create({
        usuario1_id: usuarioId,
        usuario2_id: null,
        fecha_union: new Date(),
        codigo_vinculacion: nuevoCodigo
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Desvinculación exitosa',
      data: {
        mensaje: 'La pareja ha sido desvinculada. Ahora puedes vincularte con alguien más.'
      }
    });

  } catch (error) {
    console.error('Error en desvincular:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al desvincular pareja',
      error: error.message
    });
  }
};

// =============================================
// OBTENER CÓDIGO DE VINCULACIÓN
// =============================================
export const getCode = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Buscar la pareja donde el usuario es usuario1
    const pareja = await Pareja.findOne({
      where: { usuario1_id: usuarioId }
    });

    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró código de vinculación'
      });
    }

    // Si ya tiene pareja completa, no mostrar código
    if (pareja.usuario2_id !== null) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una pareja vinculada. No necesitas compartir el código.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        codigo_vinculacion: pareja.codigo_vinculacion,
        mensaje: 'Comparte este código con tu pareja para que se vincule contigo'
      }
    });

  } catch (error) {
    console.error('Error en getCode:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener código',
      error: error.message
    });
  }
};

// =============================================
// REGENERAR CÓDIGO DE VINCULACIÓN
// =============================================
export const regenerarCodigo = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Buscar la pareja donde el usuario es usuario1
    const pareja = await Pareja.findOne({
      where: { usuario1_id: usuarioId }
    });

    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja creada'
      });
    }

    // Verificar que no tenga pareja vinculada
    if (pareja.usuario2_id !== null) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una pareja vinculada. No puedes regenerar el código.'
      });
    }

    // Generar nuevo código
    pareja.codigo_vinculacion = generarCodigoUnico();
    await pareja.save();

    return res.status(200).json({
      success: true,
      message: 'Código regenerado exitosamente',
      data: {
        codigo_vinculacion: pareja.codigo_vinculacion
      }
    });

  } catch (error) {
    console.error('Error en regenerarCodigo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al regenerar código',
      error: error.message
    });
  }
};

// =============================================
// OBTENER INFORMACIÓN DE LA PAREJA
// =============================================
export const getParejaInfo = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Buscar la pareja del usuario
    const pareja = await Pareja.findOne({
      where: {
        [Op.or]: [
          { usuario1_id: usuarioId },
          { usuario2_id: usuarioId }
        ]
      },
      include: [
        { model: Usuario, as: 'usuario1', attributes: ['id', 'nombre', 'email', 'foto_perfil'] },
        { model: Usuario, as: 'usuario2', attributes: ['id', 'nombre', 'email', 'foto_perfil'] }
      ]
    });

    if (!pareja) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una pareja'
      });
    }

    const tienePareja = pareja.usuario2_id !== null;
    const miPareja = pareja.usuario1_id === usuarioId ? pareja.usuario2 : pareja.usuario1;

    return res.status(200).json({
      success: true,
      data: {
        pareja: {
          id: pareja.id,
          fecha_union: pareja.fecha_union,
          codigo_vinculacion: !tienePareja ? pareja.codigo_vinculacion : null,
          miPareja: tienePareja ? miPareja : null,
          tienePareja
        }
      }
    });

  } catch (error) {
    console.error('Error en getParejaInfo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener información de pareja',
      error: error.message
    });
  }
};

// =============================================
// FUNCIÓN AUXILIAR: GENERAR CÓDIGO ÚNICO
// =============================================
const generarCodigoUnico = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};