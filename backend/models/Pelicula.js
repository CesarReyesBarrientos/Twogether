import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Pelicula = sequelize.define('Pelicula', {
  id_pelicula: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_tmdb: {
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
  director: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  genero: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  duracion: {
    type: DataTypes.SMALLINT,
    allowNull: true
  },
  poster_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  fecha_lanzamiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'pelicula',
  timestamps: false
});

export default Pelicula;