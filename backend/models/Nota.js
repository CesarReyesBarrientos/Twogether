import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Nota = sequelize.define('Nota', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El texto de la nota no puede estar vacío'
      },
      len: {
        args: [1, 5000],
        msg: 'La nota debe tener entre 1 y 5000 caracteres'
      }
    }
  },
  cita_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'citas',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'La cita es requerida'
      }
    }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'El usuario es requerido'
      }
    }
  }
}, {
  tableName: 'notas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['cita_id']
    },
    {
      fields: ['usuario_id']
    }
  ]
});

export default Nota;