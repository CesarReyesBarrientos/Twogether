import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Cancion = sequelize.define('Cancion', {
  id_cancion: {
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
  duracion: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  imagen: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  id_album: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'album',
      key: 'id_album'
    }
  }
}, {
  tableName: 'cancion',
  timestamps: false
});

export default Cancion;