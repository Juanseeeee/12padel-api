// routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const turnController = require('../controllers/turnController');

// Obtener todas los turnos
router.get('/turns', turnController.getTurnos);

// Obtener un turno por ID
router.get('/turns/:id', turnController.getTurnoById);

// Crear un nuevo turno
router.post('/turns/add', turnController.createTurno);

// Actualizar un turno por ID
router.put('/turns/update/:id', turnController.updateTurno);

// Eliminar un turno por ID
router.delete('/turns/delete/:id', turnController.deleteTurno);

// Obtener un turno por Date
router.get('/turns/:date', turnController.getTurnosByFecha);

/* router.get('/turns/:turnID/players', turnController.getPlayersByTurnId);
 */
router.get('/turns/turnos-ocupados', turnController.getTurnosOcupados);

/* router.get('/turns/:fecha/:hora', turnController.obtenerTurnoPorFechaYHora);
 */
router.get('/turns/availableHours', turnController.obtenerHorarios);


module.exports = router;
