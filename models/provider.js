const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const Provider = mongoose.model('Provider', ProviderSchema);

module.exports = Provider;
