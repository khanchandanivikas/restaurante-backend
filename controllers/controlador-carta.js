const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const cloudinary = require("../utils/cloudinary");
const Carta = require("../models/carta");

// crear nueva carta
const crearCarta = async (req, res, next) => {
  let result;
  try {
    result = await cloudinary.uploader.upload(req.file.path, {
      folder: "carta",
    });
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido guardar los datos"
    );
    error.code = 500;
    return next(error);
  }
  const nuevaCarta = new Carta({
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    categoria: req.body.categoria,
    imagen: result.secure_url,
    cloudinary_id: result.public_id,
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await nuevaCarta.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error("No se han podido guardar los datos");
    error.code = 500;
    return next(error);
  }
  res.status(201).json({ carta: nuevaCarta });
};

// recuperar todos las cartas
const recuperarTodosCartas = async (req, res, next) => {
  try {
    cartas = await Carta.find();
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!cartas) {
    const error = new Error("No existen cartas");
    error.code = 404;
    return next(error);
  }
  res.json({
    cartas: cartas,
  });
};

// recuperar carta por categoria
const recuperarCartasPorCategoria = async (req, res, next) => {
  const categoriaCarta = req.params.categoria;
  let cartas;
  try {
    cartas = await Carta.find({ categoria: { $eq: categoriaCarta } });
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!cartas) {
    const error = new Error("No existen cartas en este categoria");
    error.code = 404;
    return next(error);
  }
  res.json({
    cartas: cartas,
  });
};

// consultar carta por nombre del plato
const recuperarCartasPorNombre = async (req, res, next) => {
  const nombrePlato = req.params.nombre;
  let plato;
  try {
    plato = await Carta.findOne({ nombre: { $eq: nombrePlato } });
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!plato) {
    const error = new Error("No existe plato con este nombre");
    error.code = 404;
    return next(error);
  }
  res.json({
    plato: plato,
  });
};

// modificar precio del plato por su nombre
const modificarCarta = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("error de validacion, comprueba los datos");
    error.code = 422;
    return next(error);
  }
  const nombrePlato = req.params.nombre;
  const { precio } = req.body;
  let plato;
  try {
    plato = await Carta.findOne({ nombre: { $eq: nombrePlato } });
  } catch (err) {
    const error = new Error(
      "Ha habido algún problema. No se ha podido actualizar la información del carta"
    );
    error.code = 500;
    return next(error);
  }
  if (!plato) {
    const error = new Error("No existen datos");
    error.code = 404;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    plato.precio = precio;
    await plato.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error(
      "Ha habido algún problema. No se ha podido guardar la información actualizada"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    plato,
  });
};

// eliminar carta + imagen por nombre del plato
const eliminarCarta = async (req, res, next) => {
  const nombrePlato = req.params.nombre;
  let plato;
  try {
    plato = await Carta.findOne({ nombre: { $eq: nombrePlato } });
  } catch (err) {
    const error = new Error(
      "ha habido alguna problema. no se ha podido recuperar los datos para eliminacion"
    );
    error.code = 500;
    return next(error);
  }
  if (!plato) {
    const error = new Error(
      "no se ha podido localizar un plato con el nombre propocionado"
    );
    error.code = 404;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await cloudinary.uploader.destroy(plato.cloudinary_id);
    await plato.remove({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    message: "plato eliminado",
  });
};

exports.crearCarta = crearCarta;
exports.recuperarTodosCartas = recuperarTodosCartas;
exports.recuperarCartasPorCategoria = recuperarCartasPorCategoria;
exports.recuperarCartasPorNombre = recuperarCartasPorNombre;
exports.modificarCarta = modificarCarta;
exports.eliminarCarta = eliminarCarta;
