const express = require('express');
const router = express.Router();
const { createPreference } = require('../controllers/paymentController');

// Ruta para crear una preferencia de pago
router.post('/mercadopago/preference', createPreference);

module.exports = router;
