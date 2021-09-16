const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const datoSchema = new Schema({
  region: {
    type: String,
    required: true,
  },
  direccion: {
    type: String,
    required: true,
  },
  provincia: {
    type: String,
    required: true,
  },
  cuidad: {
    type: String,
    required: true,
  },
  cp: {
    type: Number,
    minLength: 3,
    required: true,
  },
  telefono: {
    type: Number,
    minLength: 5,
    required: true,
  },
  usuario: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Usuario",
  },
});

module.exports = mongoose.model("Dato", datoSchema);
