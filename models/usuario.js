const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    minLength: 6,
    unique: true,
  },
  password: {
    type: String,
    minLength: 6,
    required: true,
  },
  dato: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Dato",
      default: [],
    },
  ],
  pedido: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Pedido",
      default: [],
    },
  ],
});

usuarioSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Usuario", usuarioSchema);
