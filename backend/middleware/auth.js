import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

// =============================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// =============================================
export const auth = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Extraer el token (después de "Bearer ")
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tu_secreto_super_seguro'
    );

    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Agregar usuario al request
    req.usuario = usuario;
    
    // Continuar con la siguiente función
    next();

  } catch (error) {
    console.error('Error en middleware auth:', error);

    // Manejar errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación',
      error: error.message
    });
  }
};

// =============================================
// MIDDLEWARE OPCIONAL: Verificar si tiene pareja
// =============================================
export const requireCouple = async (req, res, next) => {
  try {
    const { Pareja } = await import('../models/index.js');
    const { Op } = await import('sequelize');

    const usuarioId = req.usuario.id;

    // Buscar pareja del usuario
    const pareja = await Pareja.findOne({
      where: {
        [Op.or]: [
          { usuario1_id: usuarioId },
          { usuario2_id: usuarioId }
        ],
        usuario2_id: { [Op.not]: null } // Debe tener pareja completa
      }
    });

    if (!pareja) {
      return res.status(403).json({
        success: false,
        message: 'Debes tener una pareja vinculada para acceder a este recurso'
      });
    }

    // Agregar pareja al request
    req.pareja = pareja;
    next();

  } catch (error) {
    console.error('Error en middleware requireCouple:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar pareja',
      error: error.message
    });
  }
};