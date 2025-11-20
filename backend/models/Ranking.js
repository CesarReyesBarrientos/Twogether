import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Ranking = sequelize.define('Ranking', {
  id_ranking: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  item_tipo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  clasificacion: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  }
}, {
  tableName: 'ranking',
  timestamps: false
});

export default Ranking;