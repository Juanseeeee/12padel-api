const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    importe:{
        type:Number,
        required: true
    },
    metodo:{
        type: String,
        enum: ['Efectivo', 'Transferencia'], // Puedes agregar otros estados si es necesario
        required: true,
    },
    fecha:{
        type: Date,
        required: true
    }
})

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;