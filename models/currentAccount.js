const mongoose = require('mongoose');

const currentAccountSchema = new mongoose.Schema({
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    payments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',  // Referencia a los pagos
        required: false
      }],
    consumptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consumption',  // Referencia a los consumos
        required: false
    }],
    balanceDue:{
        type: Number,
        required: true
    }
})

const CurrentAccount = mongoose.model('CurrentAccount', currentAccountSchema);

module.exports = CurrentAccount;