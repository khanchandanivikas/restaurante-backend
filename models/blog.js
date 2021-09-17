const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema({
  author: {
    type: String,
    required: true,
  },
  fecha: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
    minLength: 6,
  },
  imagen: {
    type: String,
  },
  cloudinary_id: {
    type: String,
  },
});

module.exports = mongoose.model("Blog", blogSchema);
