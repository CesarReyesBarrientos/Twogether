import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ListaCancion = sequelize.define('ListaCancion', {
  id_lista: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  estado: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'guardada'
  },
  fecha_agregado: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  id_cancion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cancion',
      key: 'id_cancion'
    }
  },
  id_pareja: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pareja',
      key: 'id_pareja'
    }
  }
}, {
  tableName: 'lista_canciones',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_pareja', 'id_cancion']
    }
  ]
});

export default ListaCancion;