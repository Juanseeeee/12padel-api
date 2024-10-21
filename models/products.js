const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true 
    },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  quantity: {
      type: Number,
      default: 0 
    },
  costPrice: {
     type: Number, 
     required: true 
    },
  marginProfit: {
     type: Number,
     required: true
  },
  publicPrice: {
     type: Number, 
     required: true 
    },

});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
