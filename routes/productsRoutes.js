const express = require('express');
const router = express.Router();
const productController = require('../controllers/productsController');

// Crear un nuevo producto
router.post('/products/add', productController.createProduct);

// Obtener todos los productos
router.get('/products', productController.getProducts);

// Actualizar un producto por ID
router.put('/products/update/:id', productController.updateProduct);

// Eliminar un producto por ID
router.delete('/products/delete/:id', productController.deleteProduct);

router.get('/products/:id',productController.getProductById);


module.exports = router;
