// routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener todas los turnos
router.post('/auth/register', userController.register);

// Obtener un turno por ID
router.post('/auth/login' , userController.login);

module.exports = router;
