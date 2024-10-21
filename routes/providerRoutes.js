const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');

// Obtener todos los proveedores
router.get('/providers', providerController.getAllProviders);

// Crear un nuevo proveedor
router.post('/providers/add', providerController.createProvider);

// Actualizar un proveedor por ID
router.put('/providers/update/:id', providerController.updateProvider);

// Eliminar un proveedor por ID
router.delete('/providers/delete/:id', providerController.deleteProvider);

module.exports = router;
