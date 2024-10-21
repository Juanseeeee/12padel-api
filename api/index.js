require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http').Server(app);
const cron = require('node-cron');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

app.use(cors()); 
app.options('*', cors());

// Configuración de bodyParser para manejar JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a la base de datos:'));
db.once('open', () => {
    console.log('Conectado a la base de datos');
});

//Rutas
const productsRoutes = require('../routes/productsRoutes');
app.use('/api', productsRoutes);

const brandsRoutes = require('../routes/brandsRoutes');
app.use('/api', brandsRoutes);

const clientsRoutes = require('../routes/clientsRoutes');
app.use('/api', clientsRoutes);

const paymentRoutes = require('../routes/paymentRoutes');
app.use('/api', paymentRoutes);

const userRoutes = require('../routes/userRoutes');
app.use('/api', userRoutes);

const consumptionRoutes = require('../routes/consumptionRoutes');
app.use('/api', consumptionRoutes);

const currentAccountRoutes = require('../routes/currentAccountRoutes');
app.use('/api', currentAccountRoutes);

const providerRoutes = require('../routes/providerRoutes');
app.use('/api', providerRoutes);

// Puerto de escucha
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' + port);
});
