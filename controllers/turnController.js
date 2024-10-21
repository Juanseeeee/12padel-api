const Turno = require('../models/turn');
const moment = require('moment'); // Para manejo de fechas


// Obtener todos los turnos
const getTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find();
    res.status(200).json(turnos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los turnos', error });
  }
};

// Crear un nuevo turno
const createTurno = async (req, res) => {
  try {
    const { fecha, hora, jugadores } = req.body;

    // Verificar si el turno ya está ocupado
    const turnoExistente = await Turno.findOne({ fecha, hora });
    if (turnoExistente) {
        return res.status(400).json({ message: 'El turno ya está ocupado' });
    }

    // Crear y guardar el nuevo turno
    const nuevoTurno = new Turno({
        fecha,
        hora,
        jugadores
    });
    await nuevoTurno.save();

    res.status(201).json({ message: 'Turno reservado con éxito' });
} catch (error) {
    res.status(500).json({ message: 'Error al reservar el turno', error });
}
};

// Actualizar un turno
const updateTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { pagado, consumo } = req.body;
    const turnoActualizado = await Turno.findByIdAndUpdate(
      id,
      { pagado, consumo },
      { new: true }
    );
    if (!turnoActualizado) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }
    res.status(200).json(turnoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el turno', error });
  }
};

// Eliminar un turno
const deleteTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const turnoEliminado = await Turno.findByIdAndDelete(id);
    if (!turnoEliminado) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }
    res.status(200).json({ message: 'Turno eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el turno', error });
  }
};

// Obtener un turno por ID
const getTurnoById = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findById(id);
    if (!turno) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }
    res.status(200).json(turno);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el turno', error });
  }
};

const getTurnosByFecha = async (req, res) => {
    try {
      const { fecha } = req.query;
  
      if (!fecha) {
        return res.status(400).json({ error: 'La fecha es requerida' });
      }
  
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
  
      // Obtener el día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
      const dayOfWeek = fechaInicio.getDay();
      let horariosDisponibles = [];
  
      // Generar horarios dependiendo del día de la semana
      if (dayOfWeek === 1 || dayOfWeek === 3) { // Martes y Jueves
        horariosDisponibles = generarHorarios('17:00', '23:59');
      } else {
        horariosDisponibles = generarHorarios('10:30', '23:59');
      }
  
      // Imprimir en la consola para depuración
      console.log('Horarios disponibles:', horariosDisponibles);
  
      // Obtener turnos ocupados de la base de datos
      const turnosOcupados = await Turno.find({
        fecha: { $gte: fechaInicio, $lte: fechaFin },
      });
  
      // Imprimir en la consola para depuración
      console.log('Turnos ocupados:', turnosOcupados);
  
      const turnosOcupadosHoras = turnosOcupados.map(turno => turno.hora);
  
      res.json({ horariosDisponibles, turnosOcupados: turnosOcupadosHoras });
    } catch (error) {
      console.error('Error al obtener los turnos por fecha:', error);
      res.status(500).json({ error: 'Error al obtener los turnos' });
    }
  };
  
  
  const generarHorarios = (horaInicio, horaFin) => {
    const horarios = [];
    const [horaInicioH, minutoInicio] = horaInicio.split(':').map(Number);
    const [horaFinH, minutoFin] = horaFin.split(':').map(Number);
  
    let horaActual = new Date();
    horaActual.setHours(horaInicioH, minutoInicio, 0, 0);
  
    const horaFinDate = new Date();
    horaFinDate.setHours(horaFinH, minutoFin, 0, 0);
  
    while (horaActual <= horaFinDate) {
      horarios.push(horaActual.toTimeString().substring(0, 5));
      horaActual.setMinutes(horaActual.getMinutes() + 90); // Incrementa por 90 minutos
    }
  
    return horarios;
  };



const getTurnosOcupados = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log('Fecha recibida:', fecha);

    if (!fecha) {
      return res.status(400).json({ error: 'La fecha es requerida' });
    }

    const fechaInicio = new Date(fecha);
    const fechaFin = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(23, 59, 59, 999);

    console.log('Fecha inicio:', fechaInicio);
    console.log('Fecha fin:', fechaFin);

    const turnosOcupados = await Turno.find({
      fecha: { $gte: fechaInicio, $lte: fechaFin },
    }).select('hora');

    console.log('Turnos ocupados:', turnosOcupados);

    const turnosOcupadosHoras = turnosOcupados.map(turno => turno.hora);

    res.json(turnosOcupadosHoras);
  } catch (error) {
    console.error('Error al obtener los turnos ocupados:', error);
    res.status(500).json({ message: 'Error al obtener los turnos ocupados', error });
  }
};


module.exports = {getTurnos , getTurnoById, createTurno, updateTurno, deleteTurno, getTurnosByFecha , getTurnosOcupados}