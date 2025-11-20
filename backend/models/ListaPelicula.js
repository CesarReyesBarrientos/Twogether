import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ListaPelicula = sequelize.define('ListaPelicula', {
  id_lista: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  estado: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  fecha_agregado: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  id_pareja: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pareja',
      key: 'id_pareja'
    }
  },
  id_pelicula: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pelicula',
      key: 'id_pelicula'
    }
  }
}, {
  tableName: 'lista_peliculas',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_pareja', 'id_pelicula']
    }
  ]
});

export default ListaPelicula;