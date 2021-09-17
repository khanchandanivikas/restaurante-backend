const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartaSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
    minLength: 6,
  },
  precio: {
    type: Number,
    required: true,
  },
  categoria: {
    type: String,
    enum: [
      "entrante",
      "segundo plato",
      "plato principal",
      "cocktail",
      "postre",
    ],
    required: true,
  },
  imagen: {
    type: String,
  },
  cloudinary_id: {
    type: String,
  },
});

module.exports = mongoose.model("Carta", cartaSchema);
