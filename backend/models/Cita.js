import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Cita = sequelize.define('Cita', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El título no puede estar vacío'
      },
      len: {
        args: [3, 200],
        msg: 'El título debe tener entre 3 y 200 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'La fecha es requerida'
      },
      isDate: {
        msg: 'Debe ser una fecha válida'
      }
    }
  },
  tipo: {
    type: DataTypes.ENUM('paseo', 'cena', 'pelicula', 'viaje', 'aniversario', 'otro'),
    allowNull: false,
    defaultValue: 'otro',
    validate: {
      isIn: {
        args: [['paseo', 'cena', 'pelicula', 'viaje', 'aniversario', 'otro']],
        msg: 'El tipo debe ser uno de los valores válidos'
      }
    }
  },
  pareja_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'parejas',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'La pareja es requerida'
      }
    }
  }
}, {
  tableName: 'citas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['pareja_id']
    },
    {
      fields: ['fecha']
    }
  ]
});

export default Cita;