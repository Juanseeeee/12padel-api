const Provider = require('../models/provider');

// Obtener todos los proveedores
const getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proveedores.' });
  }
};

// Crear un nuevo proveedor
const createProvider = async (req, res) => {
  const { name, location } = req.body;
  
  try {
    const newProvider = new Provider({
      name,
      location,
    });
    await newProvider.save();
    res.status(201).json(newProvider);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear proveedor.' });
  }
};

// Actualizar un proveedor
const updateProvider = async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;

  try {
    const updatedProvider = await Provider.findByIdAndUpdate(
      id,
      { name, address },
      { new: true }
    );
    if (!updatedProvider) {
      return res.status(404).json({ message: 'Proveedor no encontrado.' });
    }
    res.json(updatedProvider);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar proveedor.' });
  }
};

// Eliminar un proveedor
const deleteProvider = async (req, res) => {
  const { id } = req.params;
  
  try {
    const deletedProvider = await Provider.findByIdAndDelete(id);
    if (!deletedProvider) {
      return res.status(404).json({ message: 'Proveedor no encontrado.' });
    }
    res.json({ message: 'Proveedor eliminado con éxito.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar proveedor.' });
  }
};

module.exports = {getAllProviders,createProvider,updateProvider,deleteProvider};
