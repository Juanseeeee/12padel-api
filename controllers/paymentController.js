const mercadopago = require('mercadopago');

// Configura Mercado Pago
/* mercadopago.configure({
  access_token: 'TEST-4495116649483924-082813-4878f076d70b5acfef6da0ea5e970413-1040153959', // Reemplaza con tu Access Token
}); */

// Función para crear una preferencia de pago
const createPreference = async (req, res) => {
  const { fecha, hora, cancha, jugador, valorTurno } = req.body;

  const preference = {
    items: [{
      title: `Reserva de cancha: ${cancha}`,
      unit_price: valorTurno,
      quantity: 1,
    }],
    back_urls: {
      success: 'http://localhost:3001/success',
      failure: 'http://localhost:3001/failure',
      pending: 'http://localhost:3001/pending',
    },
    auto_return: 'approved',
  };

  try {
    const mpResponse = await mercadopago.preferences.create(preference);
    res.json({ init_point: mpResponse.body.init_point });
  } catch (error) {
    console.error('Error al crear la preferencia de pago:', error);
    res.status(500).json({ message: 'Error al crear la preferencia de pago' });
  }
};

module.exports = {
  createPreference,
};
