import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Album = sequelize.define('Album', {
  id_album: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_spotify: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  artista: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  genero: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  numero_canciones: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  imagen: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  fecha_lanzamiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'album',
  timestamps: false
});

export default Album;