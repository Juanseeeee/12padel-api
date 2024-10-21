const Client = require('../models/client');
const Consumption = require('../models/consumption');
const Product = require('../models/products');
const CurrentAccount = require('../models/currentAccount');
const Payment = require('../models/payment');


// Obtener todos los consumos de un cliente
const getConsumptions = async (req, res) => {
  try {
    const {sort , limit , skip , fecha} = req.query
    // Encuentra al cliente por su ID
    const client = await Client.findById(req.params.clientId)
      .populate({
        path: 'consumptions',    // Poblar el array de consumos del cliente
        populate: {
          path: 'products',      // Poblar los productos dentro de los consumos
          model: 'Product',      // Usar el modelo 'Product' para poblar
          select: 'name price ' // Seleccionar solo los campos que necesitas
        }
      });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json(client.consumptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const addConsumption = async (req, res) => {
  try {
    // Encontrar la cuenta corriente del cliente
    const currentAccount = await CurrentAccount.findOne({ client: req.params.clientId });
    
    if (!currentAccount) {
      return res.status(404).json({ message: 'Cuenta corriente no encontrada para el cliente' });
    }

    // Crear un nuevo documento en la colección Consumption
    const newConsumption = new Consumption({
      client: req.params.clientId,  // Vincula este consumo con el cliente
      products: req.body.products,  // IDs de los productos
      date: req.body.date || Date.now(),
    });

    // Guardar el nuevo consumo en la colección Consumption
    const savedConsumption = await newConsumption.save();

    // Ahora, agrega el ID del consumo recién creado a la cuenta corriente
    currentAccount.consumptions.push(savedConsumption._id);

    // Sumar el importe de los productos al saldo adeudado y descontar stock
    for (const productId of req.body.products) {
      // Encontrar el producto en la base de datos
      const product = await Product.findById(productId);

      if (product) {
        // Sumar el precio del producto al saldo adeudado de la cuenta corriente
        currentAccount.balanceDue += product.publicPrice;

        // Descontar el stock del producto (asegurando que no sea negativo)
        if (product.quantity > 0) {
          product.quantity -= 1;
        } else {
          return res.status(400).json({ message: `El producto ${product.name} no tiene stock suficiente` });
        }

        // Guardar los cambios en el producto
        await product.save();
      }
    }

    // Guardar los cambios en la cuenta corriente
    await currentAccount.save();

    // Devolver el consumo guardado
    res.status(201).json(savedConsumption);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un consumo
const updateConsumption = async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const consumption = client.consumptions.id(req.params.consumptionId);
    if (!consumption) {
      return res.status(404).json({ message: 'Consumo no encontrado' });
    }

    consumption.products = req.body.products || consumption.products;
    consumption.date = req.body.date || consumption.date;

    await client.save();

    res.status(200).json(consumption);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un consumo
const deleteConsumption = async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const consumption = client.consumptions.id(req.params.consumptionId);
    if (!consumption) {
      return res.status(404).json({ message: 'Consumo no encontrado' });
    }

    consumption.remove();
    await client.save();

    res.status(200).json({ message: 'Consumo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const lastWeekSells = async (req, res) => {
  try {
    // Obtén la fecha de hace 7 días
    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);

    // Encuentra el ID del producto "Turno Cancha"
    const product = await Product.findOne({ name: 'Turno Cancha' });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Busca todos los consumos de la última semana
    const consumptions = await Consumption.find({
      date: { $gte: sieteDiasAtras, $lte: new Date() } // Filtra por fecha entre siete días atrás y ahora
    }).populate('products'); // Poblamos los productos para obtener sus detalles

    console.log('Consumos lastWeek: ',consumptions)

    // Sumar los ingresos solo de los productos "Turno Cancha"
    const totalIngresos = consumptions.reduce((total, consumption) => {
      const monto = consumption.products.reduce((subtotal, prod) => {
        return subtotal + (prod.name === 'Turno Cancha' ? prod.publicPrice : 0); // Suma el precio solo si es "Turno Cancha"
      }, 0);
      return total + monto;
    }, 0);
    
    res.json({ ingresos: totalIngresos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los ingresos' });
  }
};

const getProfitPerWeek = async(req, res) => {
  try {
    // Obtén la fecha de hace 7 días
    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);

    // Busca todos los consumos de la última semana
    const consumptions = await Consumption.find({
      date: { $gte: sieteDiasAtras, $lte: new Date() } // Filtra por fecha entre siete días atrás y ahora
    }).populate('products'); // Poblamos los productos para obtener sus detalles

    let profit = 0; // Usa "let" en lugar de "const" para que sea modificable

    // Itera sobre los consumos y suma el precio de cada producto
    consumptions.forEach((consumo) => {
      consumo.products.forEach((prod) => {
        profit += prod.publicPrice || 0; // Asegúrate de sumar solo si existe publicPrice
      });
    });

    return res.status(200).json({ profit });

  } catch (error) {
    console.log('Algo paso q no paso ', error);
    return res.status(500).json({ message: 'Error al obtener las ganancias', error });
  }
};


const getPaymentsPerWeek = async (req, res) => {
  try {
    // Obtén la fecha de hace 7 días
    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);

    // Busca todos los pagos realizados en la última semana
    const payments = await Payment.find({
      fecha: { $gte: sieteDiasAtras, $lte: new Date() } // Filtra por fecha
    });

    console.log('Pagos encontrados: ',payments);

    // Suma todos los montos de los pagos
    const totalPayments = payments.reduce((total, pago) => total + pago.importe, 0);

    return res.status(200).json({ totalPayments });
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    return res.status(500).json({ error: 'Error al obtener los pagos' });
  }
};



module.exports = {getConsumptions, deleteConsumption, updateConsumption, addConsumption, lastWeekSells, getProfitPerWeek, getPaymentsPerWeek}