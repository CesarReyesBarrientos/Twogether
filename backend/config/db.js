import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'twogether_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '-06:00', // Ajusta según tu zona horaria
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true, // Usa snake_case en lugar de camelCase
      freezeTableName: true // No pluraliza nombres de tablas
    }
  }
);

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
};

// Función para sincronizar modelos
export const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Base de datos sincronizada');
  } catch (error) {
    console.error('❌ Error al sincronizar base de datos:', error);
    throw error;
  }
};

export default sequelize;