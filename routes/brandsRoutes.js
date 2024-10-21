// routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

// Obtener todas las marcas
router.get('/brands', brandController.getBrands);

// Obtener una marca por ID
/* router.get('/brands/:id', brandController.getBrandById); */

// Crear una nueva marca
router.post('/brands/add', brandController.createBrand);

// Actualizar una marca por ID
router.put('/brands/update/:id', brandController.updateBrand);

// Eliminar una marca por ID
router.delete('/brands/delete/:id', brandController.deleteBrand);

// Aumentar precios por marca
router.post('/brands/increasePriceByBrand', brandController.increasePriceByBrand);

// Obtener marcas y cantidad de productos
router.get('/brandsCount',brandController.getBrandsAndCount);

router.get('/brands/count', brandController.Count);

module.exports = router;
