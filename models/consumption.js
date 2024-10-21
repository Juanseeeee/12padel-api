const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConsumptionSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',  // Referencia al cliente
    required: true
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',  // Referencia a los productos
    required: true
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

const Consumption = mongoose.model('Consumption', ConsumptionSchema);
module.exports = Consumption;
