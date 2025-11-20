import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from './config/db.js';
import routes from './routes/index.js';

// Configurar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// =============================================
// CONFIGURACIÓN DE MIDDLEWARES
// =============================================

// CORS - Permitir peticiones desde el frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parser de JSON
app.use(express.json());

// Parser de URL encoded (para formularios)
app.use(express.urlencoded({ extended: true }));

// =============================================
// LOGGING DE PETICIONES (Solo en desarrollo)
// =============================================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// =============================================
// RUTA DE HEALTH CHECK
// =============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// =============================================
// MONTAR RUTAS PRINCIPALES
// =============================================
app.use('/api', routes);

// =============================================
// MANEJO GLOBAL DE ERRORES
// =============================================
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// =============================================
// INICIALIZACIÓN DEL SERVIDOR
// =============================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor Twogether...');

    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Sincronizar modelos con la base de datos
    // IMPORTANTE: En producción, usar migraciones en lugar de sync
    await syncDatabase({
      // alter: true, // Actualiza las tablas existentes (Desarrollo)
      // force: true, // PELIGRO: Borra todas las tablas y las recrea
    });

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log('✅ Servidor iniciado exitosamente');
      console.log(`📡 Escuchando en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
      console.log('───────────────────────────────────────');
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

// =============================================
// MANEJO DE ERRORES NO CAPTURADOS
// =============================================
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// =============================================
// MANEJO DE SEÑALES DE TERMINACIÓN
// =============================================
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

export default app;