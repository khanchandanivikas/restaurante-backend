const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const contactoSchema = new Schema({
  tipo: {
    type: String,
    enum: ["general", "eventos"],
    required: true,
  },
  genero: {
    type: String,
    enum: ["mr", "mrs", "ms"],
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    minLength: 6,
    required: true,
  },
  mensaje: {
    type: String,
    minLength: 5,
    required: true,
  },
});

module.exports = mongoose.model("Contacto", contactoSchema);
