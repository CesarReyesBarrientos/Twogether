const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connection} = require('./config/database');
const allRoutes = require('./routes/all_routes');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
    res.send('API is running');
});

app.get('/test', async (req, res) => {
   try {
    const connectionTest = await connection.getConnection();
       console.log({ message: 'Database connection successful' });
       res.json({ 
        status: 'success',
        message: 'Database connection successful'
       });
       connectionTest.release();
   } catch (error) {
       console.error('Error connecting to the database:', error);
       res.status(500).json({ error: 'Internal Server Error' });
   }
});

// User routes
app.use('/', allRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}/test`);
});