const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/status', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        console.log('Verificación de BD exitosa.');
        connection.release();
        res.status(200).json({
            status: 'ok',
            message: 'La conexión a la base de datos es exitosa.'
        });

    } catch (error) {
        console.error('Error al verificar la conexión a la BD:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'No se pudo establecer conexión con la base de datos.',
        });
    }
});

app.get('/', (req, res) => {
    res.send('Servidor en línea. Visita /status para verificar la conexión a la BD.');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//app.use('/api/users', userRoutes);