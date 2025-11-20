import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario, Pareja } from '../models/index.js';

// =============================================
// REGISTRAR NUEVO USUARIO
// =============================================
export const register = async (req, res) => {
  try {
    const { nombre, email, password, foto_perfil } = req.body;

    // Validar que vengan los campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y password son requeridos'
      });
    }

    // Validar longitud mínima de password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Este email ya está registrado'
      });
    }

    // Hash del password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: passwordHash,
      foto_perfil: foto_perfil || null,
      fecha_registro: new Date()
    });

    // Generar código único para vinculación
    const codigoVinculacion = generarCodigoUnico();

    // Crear una pareja con solo el usuario1 (aún sin pareja)
    await Pareja.create({
      usuario1_id: nuevoUsuario.id,
      usuario2_id: null,
      fecha_union: new Date(),
      codigo_vinculacion: codigoVinculacion
    });

    // Generar JWT
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email },
      process.env.JWT_SECRET || 'tu_secreto_super_seguro',
      { expiresIn: '30d' }
    );

    // Responder con el usuario (sin password) y token
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          foto_perfil: nuevoUsuario.foto_perfil,
          fecha_registro: nuevoUsuario.fecha_registro
        },
        codigoVinculacion,
        token
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// =============================================
// LOGIN DE USUARIO
// =============================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son requeridos'
      });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ 
      where: { email },
      include: [
        {
          model: Pareja,
          as: 'parejaComoUsuario1',
          include: [
            { model: Usuario, as: 'usuario2', attributes: ['id', 'nombre', 'email', 'foto_perfil'] }
          ]
        },
        {
          model: Pareja,
          as: 'parejaComoUsuario2',
          include: [
            { model: Usuario, as: 'usuario1', attributes: ['id', 'nombre', 'email', 'foto_perfil'] }
          ]
        }
      ]
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Validar password
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Determinar la pareja del usuario
    const pareja = usuario.parejaComoUsuario1 || usuario.parejaComoUsuario2;
    const tienePareja = pareja && (pareja.usuario2_id !== null);
    const infoPareja = tienePareja ? {
      id: pareja.id,
      fecha_union: pareja.fecha_union,
      codigo_vinculacion: pareja.codigo_vinculacion,
      parejaDe: pareja.usuario2_id === usuario.id ? pareja.usuario1 : pareja.usuario2
    } : {
      id: pareja?.id,
      codigo_vinculacion: pareja?.codigo_vinculacion,
      parejaDe: null
    };

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'tu_secreto_super_seguro',
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          foto_perfil: usuario.foto_perfil,
          fecha_registro: usuario.fecha_registro
        },
        pareja: infoPareja,
        tienePareja,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// =============================================
// OBTENER PERFIL DEL USUARIO AUTENTICADO
// =============================================
export const getProfile = async (req, res) => {
  try {
    const usuarioId = req.usuario.id; // Viene del middleware de autenticación

    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Pareja,
          as: 'parejaComoUsuario1',
          include: [
            { model: Usuario, as: 'usuario2', attributes: ['id', 'nombre', 'email', 'foto_perfil'] }
          ]
        },
        {
          model: Pareja,
          as: 'parejaComoUsuario2',
          include: [
            { model: Usuario, as: 'usuario1', attributes: ['id', 'nombre', 'email', 'foto_perfil'] }
          ]
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Determinar la pareja del usuario
    const pareja = usuario.parejaComoUsuario1 || usuario.parejaComoUsuario2;
    const tienePareja = pareja && (pareja.usuario2_id !== null);

    return res.status(200).json({
      success: true,
      data: {
        usuario,
        tienePareja,
        pareja: pareja || null
      }
    });

  } catch (error) {
    console.error('Error en getProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
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