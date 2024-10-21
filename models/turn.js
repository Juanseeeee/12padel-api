const mongoose = require('mongoose');

const TurnoSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  jugadores: [{
      type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    }
  ],
  pagado: {
    type: Boolean,
    default: false
  },
  consumo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consumption',
        required: true
      }
  ]
});

const Turno = mongoose.model('Turno', TurnoSchema);

module.exports = Turno;
