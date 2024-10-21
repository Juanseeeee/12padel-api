const express = require('express');
const clientsController = require('../controllers/clientsController');

const router = express.Router();

// Rutas para el CRUD de clientes
router.post('/clients/add', clientsController.crearCliente); // Crear un cliente
router.get('/clients', clientsController.obtenerClientes); // Obtener todos los clientes
router.get('/clients/:id', clientsController.obtenerClientePorId); // Obtener un cliente por ID
router.put('/clients/update/:id', clientsController.actualizarCliente); // Actualizar un cliente por ID
router.delete('/clients/delete/:id', clientsController.eliminarCliente); // Eliminar un cliente por ID

module.exports = router;
