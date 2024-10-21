// controllers/brandController.js
const Brand = require('../models/brand');
const Product = require('../models/products'); // Si estás usando el modelo de producto para actualizar precios

// Obtener todas las marcas
const getBrands = async (req, res) => {
    try {
      const brands = await Brand.find().sort('name');
      res.json(brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({ message: 'Error fetching brands' });
    }
  };

const getBrandsAndCount = async(req, res) =>{
  try {
    const brands = await Brand.find();
    const brandsWithProductCount = await Promise.all(brands.map(async (brand) => {
      /* // Si el campo brand en Product es un ObjectId
      const productCount = await Product.countDocuments({
        brand: brand._id
      }); */

      // Si el campo brand en Product es una cadena (nombre de la marca)
      const productCount = await Product.countDocuments({
         brand: brand.name
       });

      return {
        ...brand._doc,
        productCount
      };
    }));
    res.json(brandsWithProductCount);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las marcas', error });
  }
};

  
  // Obtener una marca por ID
/*   const getBrandById = async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      res.json(brand);
    } catch (error) {
      console.error('Error fetching brand:', error);
      res.status(500).json({ message: 'Error fetching brand' });
    }
  }; */
  
  // Crear una nueva marca
  const createBrand = async (req, res) => {
    try {
      const brand = new Brand(req.body);
      await brand.save();
      res.status(201).json(brand);
    } catch (error) {
      console.error('Error creating brand:', error);
      res.status(400).json({ message: 'Error creating brand' });
    }
  };
  
  // Actualizar una marca por ID
  const updateBrand = async (req, res) => {
    try {
      const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      res.json(brand);
    } catch (error) {
      console.error('Error updating brand:', error);
      res.status(400).json({ message: 'Error updating brand' });
    }
  };
  
  // Eliminar una marca por ID
  const deleteBrand = async (req, res) => {
    try {
      const brand = await Brand.findByIdAndDelete(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
      console.error('Error deleting brand:', error);
      res.status(500).json({ message: 'Error deleting brand' });
    }
  };

// Aumentar precios por marca
const increasePriceByBrand = async (req, res) => {
  const { brand, percentage } = req.body;

  if (!brand || isNaN(percentage)) {
    return res.status(400).json({ message: 'Marca y porcentaje son necesarios.' });
  }

  try {
    // Calcula el factor de aumento (por ejemplo, 15% => 1.15)
    const factor = 1 + (percentage / 100);
    
    // Encuentra los productos antes de actualizarlos
    const products = await Product.find({ brand });
    
    // Actualiza los precios de los productos que coinciden con la marca especificada
    const result = await Product.updateMany(
      { brand },
      { $mul: { price: factor } }
    );

    // Prepara los productos con precios viejos y nuevos
    const updatedProducts = products.map(product => ({
      ...product._doc,
      oldPrice: product.price,
      newPrice: Math.round(product.price * factor) // Redondear el nuevo precio
    }));

    res.status(200).json({ 
      message: 'Precios actualizados correctamente', 
      result, 
      updatedProducts 
    });
  } catch (error) {
    console.error('Error al actualizar precios:', error);
    res.status(500).json({ message: 'Error al actualizar precios' });
  }
};

const Count = async (req, res) => {
  try {
    // Obtener la cantidad de marcas
    const count = await Brand.countDocuments();
    
    // Enviar la respuesta como un objeto JSON
    res.json({ count });
  } catch (error) {
    // Manejar errores
    console.error('Error al obtener la cantidad de marcas:', error);
    res.status(500).json({ message: 'Error al obtener la cantidad de marcas', error });
  }
};

module.exports = { getBrands , increasePriceByBrand , createBrand , updateBrand , deleteBrand , /* getBrandById  ,*/ getBrandsAndCount , Count }
