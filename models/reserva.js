const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reservaSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    minLength: 6,
  },
  fecha: {
    type: String,
    required: true,
  },
  hora: {
    type: String,
    required: true,
  },
  comensales: {
    type: Number,
    required: true,
    min: 1,
  },
});

module.exports = mongoose.model("Reserva", reservaSchema);
