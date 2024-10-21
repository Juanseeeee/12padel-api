const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  }
});

const Client = mongoose.model('Client', ClientSchema);
module.exports = Client;
