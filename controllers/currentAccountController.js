const CurrentAccount = require('../models/currentAccount');
const Payment = require('../models/payment');
const Customer = require('../models/client');  // Asegúrate de que la ruta es correcta
const Consumption = require('../models/consumption');


// Crear una nueva cuenta corriente para un cliente
const createCurrentAccount = async (req, res) => {
  try {
    const { customer , balanceDue} = req.body;

    // Verificar que el cliente no tenga ya una cuenta corriente
    const existingAccount = await CurrentAccount.findOne({ client : customer });
    if (existingAccount) {
      return res.status(400).json({ message: 'El cliente ya tiene una cuenta corriente.' });
    }

    // Crear la cuenta corriente
    const newAccount = new CurrentAccount({
      client,
      balanceDue: 0, // Balance inicial (puede ser 0)
    });

    await newAccount.save();
    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Error al crear la cuenta corriente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
  
// Obtener una cuenta corriente por cliente con paginación y count de facturas
const getCurrentAccountByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Parámetros de paginación

    // Convertir los parámetros a números (si es necesario)
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Buscar la cuenta corriente del cliente
    const currentAccount = await CurrentAccount.findOne({ client: customerId })
      .populate({
        path: 'client', // Llena los datos del cliente
        select: 'name phone' // Ajusta los campos según el modelo de cliente
      })
      .populate({
        path: 'consumptions', // Llena los datos de consumptions
        populate: {
          path: 'products', // Suponiendo que el consumo tiene productos relacionados
          select: 'name price', // Seleccionar campos específicos de productos
        }
      });

    if (!currentAccount) {
      return res.status(404).json({ message: 'Cuenta corriente no encontrada para este cliente.' });
    }


    res.status(200).json({
      currentAccount
    });
  } catch (error) {
    console.error('Error al obtener la cuenta corriente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};




const getCurrentAccounts = async (req, res) => {
  try {
    const { name, page = 1, limit = 5, sort={fecha : -1} } = req.query;
    let allAccounts = [];
    let totalAccounts = 0;

    // Si se pasa un nombre, buscamos el cliente por nombre
    if (name) {
      const filter = { name: new RegExp(name, 'i') };
      console.log('Filtro aplicado:', filter);

      const customer = await Customer.findOne(filter);

      if (!customer) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }

      console.log('Cliente buscado: ', customer);

      // Contar el total de cuentas corrientes del cliente encontrado
      totalAccounts = await CurrentAccount.countDocuments({ customer: customer._id });

      // Obtener las cuentas corrientes del cliente encontrado con paginación
      allAccounts = await CurrentAccount.find({ customer: customer._id })
        .populate({
          path: 'client',
          select: 'name phone'
        })
    } else {
      // Contar el total de cuentas corrientes si no se filtra por nombre
      totalAccounts = await CurrentAccount.countDocuments();

      // Si no se pasa el nombre, traemos todas las cuentas corrientes con paginación
      allAccounts = await CurrentAccount.find()
        .populate({
          path: 'client',
          select: 'name phone'
        })

    }

    console.log('Cuentas encontradas:', allAccounts);


    // Devolver los datos con los contadores adicionales
    res.status(200).json({
        allAccounts,
        totalAccounts,
    });
  } catch (error) {
    console.error('Error al obtener las cuentas corrientes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};



const getCurrentAccountsByName = async (req, res) => {
  try {
    const { name } = req.query; // Capturamos el nombre de la query
    const regex = new RegExp(name, 'i'); // Creamos una expresión regular para búsqueda flexible (insensible a mayúsculas/minúsculas)

    // Ahora, buscamos las cuentas corrientes asociadas a esos IDs de clientes
    const accounts = await CurrentAccount.find({ customer: { $in: clientIds } })
      .populate('customer') // Popula los datos del cliente en la cuenta
      .exec();

    // Filtramos las cuentas según el balance
    const allAccounts = accounts;
    const pendingAccounts = accounts.filter(account => account.balanceDue < 0);
    const zeroOrPositiveAccounts = accounts.filter(account => account.balanceDue >= 0);

    // Respondemos con las cuentas encontradas
    res.status(200).json({
      allAccounts,
      pendingAccounts,
      zeroOrPositiveAccounts
    });
  } catch (error) {
    console.error('Error al obtener las cuentas corrientes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const makePayment = async (req, res) => {
    const { clientId } = req.params;
    const { importe, metodo } = req.body;

    // Validar parámetros de entrada
    if (typeof importe !== 'number' || importe <= 0) {
        return res.status(400).json({ error: 'El importe debe ser un número positivo.' });
    }
    if (!metodo) {
        return res.status(400).json({ error: 'El método de pago es obligatorio.' });
    }

    try {
        // Crear el nuevo pago
        const newPayment = new Payment({ importe, metodo, fecha: new Date() });
        await newPayment.save(); // Guardar el nuevo pago

        // Encontrar la cuenta corriente del cliente
        const currentAccount = await CurrentAccount.findOne({ client: clientId })
        .populate({
            path: 'client',
            select: ' name phone'
        });
        if (!currentAccount) {
            return res.status(404).json({ error: 'Cuenta corriente no encontrada.' });
        }

        // Agregar el nuevo pago a la cuenta corriente
        currentAccount.payments.push(newPayment);
        currentAccount.balanceDue -= newPayment.importe;

        // Asegurarse de que el saldo no sea negativo
        if (currentAccount.balanceDue < 0) {
            return res.status(400).json({ error: 'El pago excede el saldo adeudado.' });
        }

        await currentAccount.save(); // Guardar la cuenta corriente actualizada

        res.status(200).json({
            currentAccount,
            message: 'Pago realizado exitosamente.',
            newBalance: currentAccount.balanceDue // Incluir el nuevo saldo en la respuesta
        });
    } catch (error) {
        console.error('Error al hacer pago:', error);
        res.status(500).json({ error: 'Ocurrió un error al procesar el pago.' });
    }
};

const getPayments = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { page = 1, limit = 5, sort , fecha } = req.query; // Recibimos la página, el límite y la fecha de los parámetros de consulta

        // Primero obtenemos la cuenta corriente del cliente
        const currentAccount = await CurrentAccount.findOne({ client: clientId });

        if (!currentAccount) {
            return res.status(404).json({ message: 'Cuenta corriente no encontrada' });
        }

        // Si hay filtro por fecha, aplicamos el rango de fechas
        const fechaFiltro = fecha
            ? { fecha: { $gte: new Date(fecha), $lt: new Date(new Date(fecha).setDate(new Date(fecha).getDate() + 1)) } }
            : {};

        // Contamos el total de pagos (sin paginación)
        const totalPayments = await Payment.countDocuments({
            _id: { $in: currentAccount.payments },
            ...fechaFiltro, // Aplicamos el filtro de fecha si existe
        });

        console.log('Total de pagos: ', totalPayments); // Esto debería ahora mostrar el total correcto

        // Luego aplicamos la paginación y traemos los pagos
        const pagosPaginados = await Payment.find({
            _id: { $in: currentAccount.payments },
            ...fechaFiltro, // Aplicamos el filtro de fecha si existe
        })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({fecha : -1});

        // Respondemos con los pagos paginados y la información de paginación
        res.status(200).json({
            payments: pagosPaginados,
            totalPayments,
            currentPage: page,
            totalPages: Math.ceil(totalPayments / limit)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Algo salió mal.' });
    }
};

const getConsumptions = async (req,res) => {
    try {
        const { clientId } = req.params;
        const { page = 1, limit = 5, sort , fecha } = req.query; // Recibimos la página, el límite y la fecha de los parámetros de consulta

        // Primero obtenemos la cuenta corriente del cliente
        const currentAccount = await CurrentAccount.findOne({ client: clientId });

        if (!currentAccount) {
            return res.status(404).json({ message: 'Cuenta corriente no encontrada' });
        }

        // Si hay filtro por fecha, aplicamos el rango de fechas
        const fechaFiltro = fecha
            ? { fecha: { $gte: new Date(fecha), $lt: new Date(new Date(fecha).setDate(new Date(fecha).getDate() + 1)) } }
            : {};

        // Contamos el total de pagos (sin paginación)
        const totalConsumptions = await Consumption.countDocuments({
            _id: { $in: currentAccount.consumptions },
            ...fechaFiltro, // Aplicamos el filtro de fecha si existe
        });

        console.log('Total de Consumiciones: ', totalConsumptions); // Esto debería ahora mostrar el total correcto

        // Luego aplicamos la paginación y traemos los pagos
        const consumosPaginados = await Consumption.find({
            _id: { $in: currentAccount.consumptions },
            ...fechaFiltro, // Aplicamos el filtro de fecha si existe
        })
        .populate({
            'path': 'products'
        })
        .sort({date : -1})
        .skip((page - 1) * limit)
        .limit(parseInt(limit)*1)

        // Respondemos con los pagos paginados y la información de paginación
        res.status(200).json({
            consumptions: consumosPaginados,
            totalConsumptions,
            currentPage: page,
            totalPages: Math.ceil(totalConsumptions / limit)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Algo salió mal.' });
    }
};




module.exports = {createCurrentAccount,getCurrentAccountByCustomer,getCurrentAccounts,getCurrentAccountsByName, makePayment , getPayments, getConsumptions};
