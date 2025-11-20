import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre no puede estar vacío'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      msg: 'Este email ya está registrado'
    },
    validate: {
      isEmail: {
        msg: 'Debe ser un email válido'
      },
      notEmpty: {
        msg: 'El email no puede estar vacío'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La contraseña no puede estar vacía'
      }
    }
  },
  foto_perfil: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
    validate: {
      isUrl: {
        msg: 'La foto de perfil debe ser una URL válida'
      }
    }
  },
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

export default Usuario;