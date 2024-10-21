const express = require('express');
const router = express.Router();
const consumptionController = require('../controllers/consumptionController');

// Obtener todos los consumos de un cliente
router.get('/consumptions/:clientId', consumptionController.getConsumptions);

// Agregar un nuevo consumo
router.post('/consumptions/add/:clientId', consumptionController.addConsumption);

// Eliminar un consumo
router.delete('/consumptions/delete/:consumptionId', consumptionController.deleteConsumption);

router.put('/consumptions/update/:consumptionId',consumptionController.updateConsumption);

router.get('/lastWeekSells', consumptionController.lastWeekSells);

router.get('/getProfitLastWeek', consumptionController.getProfitPerWeek);

router.get('/getPaymentsLastWeek', consumptionController.getPaymentsPerWeek);



module.exports = router;
