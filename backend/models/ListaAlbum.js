import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ListaAlbum = sequelize.define('ListaAlbum', {
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
  id_album: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'album',
      key: 'id_album'
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
  tableName: 'lista_albumes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_pareja', 'id_album']
    }
  ]
});

export default ListaAlbum;