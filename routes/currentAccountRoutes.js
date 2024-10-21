const express = require('express');
const router = express.Router();
const currentAccountController = require('../controllers/currentAccountController');

// Ruta para crear una cuenta corriente
router.post('/currentAccounts/create', currentAccountController.createCurrentAccount);

// Ruta para obtener una cuenta corriente por cliente
router.get('/currentAccounts/:customerId', currentAccountController.getCurrentAccountByCustomer);

router.get('/currentAccounts', currentAccountController.getCurrentAccounts);

router.post('/currentAccounts/makePayment/:clientId', currentAccountController.makePayment);

router.get('/currentAccounts/payments/:clientId',currentAccountController.getPayments);

router.get('/currentAccounts/consumptions/:clientId',currentAccountController.getConsumptions);

module.exports = router;
