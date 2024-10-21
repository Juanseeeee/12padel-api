const Cliente = require('../models/client');
const CurrentAccount = require('../models/currentAccount');

// Crear un nuevo cliente
const crearCliente = async (req, res) => {
  const { name , phone } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre del cliente es requerido' });
  }

  // Verificar si el cliente ya existe
  const existingClient = await Cliente.findOne({ name: name });
    
  if (existingClient) {
    return res.status(400).json({ message: 'El cliente ya existe.' });
  }

  try {


    const nuevoCliente = new Cliente({ name , phone , balanceDue : 0});
    await nuevoCliente.save();

    const clienteGuardado = await Cliente.findOne({name : name})
    console.log('Cliente:' , clienteGuardado)
    const idCliente = clienteGuardado._id

    const nuevaCuentaCorriente = new CurrentAccount({client : idCliente, balanceDue : 0})
    await nuevaCuentaCorriente.save();

    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
};

// Obtener un cliente por su ID
const obtenerClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
};

// Actualizar un cliente por su ID
const actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { name , phone } = req.body;

  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(
      id,
      { name, phone },
      { new: true } // Para devolver el documento actualizado
    );

    if (!clienteActualizado) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.status(200).json(clienteActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

// Eliminar un cliente por su ID
const eliminarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(id);

    if (!clienteEliminado) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
};

module.exports = {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
};
