const Product = require('../models/products');

// Crear un nuevo producto
const createProduct = async (req, res) => {
  const { name, provider, quantity, costPrice , marginProfit } = req.body;
  try {
    const publicPrice = costPrice * (1 + ( marginProfit / 100 ))
    const newProduct = new Product({ name, provider, quantity, costPrice, marginProfit ,publicPrice });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'name';
    const sortDirection = req.query.sortDirection || 'asc';
    const provider = req.query.provider || '';
    const name = req.query.name || '';

    const query = {};
    if (provider) query.provider = provider;
    if (name) query.name = new RegExp(name, 'i'); // case-insensitive search

    const products = await Product.find(query)
      .sort({ [sortField]: sortDirection === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({path: 'provider'});

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un producto por ID
const updateProduct = async (req, res) => {
  try {
    // Extraer costPrice y marginProfit del cuerpo de la solicitud
    const { costPrice, marginProfit } = req.body;

    // Calcular el nuevo publicPrice
    let publicPrice;
    if (costPrice && marginProfit) {
      publicPrice = costPrice + (costPrice * (marginProfit / 100));
    }

    // Actualizar el producto, incluyendo el nuevo publicPrice
    const updatedData = { ...req.body, publicPrice }; // Asegúrate de incluir publicPrice en el objeto que se actualiza
    const product = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Eliminar un producto por ID
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {createProduct, getProducts, getProductById, updateProduct, deleteProduct }
