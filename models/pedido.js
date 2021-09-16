const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pedidoSchema = new Schema({
  fecha: {
    type: String,
    required: true,
  },
  productos: [
    {
      type: Array,
    },
  ],
  usuario: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Usuario",
  },
});

module.exports = mongoose.model("Pedido", pedidoSchema);
