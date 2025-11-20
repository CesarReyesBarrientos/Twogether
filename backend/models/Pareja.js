import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Pareja = sequelize.define('Pareja', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'El usuario 1 es requerido'
      }
    }
  },
  usuario2_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  fecha_union: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  codigo_vinculacion: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: {
      msg: 'Este código de vinculación ya existe'
    },
    validate: {
      notEmpty: {
        msg: 'El código de vinculación no puede estar vacío'
      },
      len: {
        args: [6, 10],
        msg: 'El código debe tener entre 6 y 10 caracteres'
      }
    }
  }
}, {
  tableName: 'parejas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['codigo_vinculacion']
    },
    {
      unique: true,
      fields: ['usuario1_id']
    },
    {
      unique: true,
      fields: ['usuario2_id']
    }
  ]
});

export default Pareja;