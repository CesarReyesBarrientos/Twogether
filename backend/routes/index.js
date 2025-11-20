import { Router } from 'express';
import authRoutes from './auth.routes.js';
import coupleRoutes from './couple.routes.js';
import mediaRoutes from './media.routes.js';
import dateRoutes from './date.routes.js';
import externalRoutes from './external.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/couple', coupleRoutes);
router.use('/media', mediaRoutes);
router.use('/dates', dateRoutes);
router.use('/external', externalRoutes);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Twogether funcionando correctamente',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      couple: '/api/couple',
      media: '/api/media',
      dates: '/api/dates',
      external: '/api/external'
    }
  });
});

router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

export default router;