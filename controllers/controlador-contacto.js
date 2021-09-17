const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Contacto = require("../models/contacto");

// recibir nuevo mensaje
const crearContacto = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("error de validacion, comprueba los datos");
    error.code = 422;
    return next(error);
  }
  const nuevoContacto = new Contacto({
    tipo: req.body.tipo,
    genero: req.body.genero,
    nombre: req.body.nombre,
    correo: req.body.correo,
    mensaje: req.body.mensaje,
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await nuevoContacto.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error("No se han podido guardar los datos");
    error.code = 500;
    return next(error);
  }
  res.status(201).json({ mensaje: nuevoContacto });
};

// recuperar todos los mensajes del contacto
const recuperarTodosContactos = async (req, res, next) => {
  try {
    contactos = await Contacto.find();
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!contactos) {
    const error = new Error("No existen mensajes");
    error.code = 404;
    return next(error);
  }
  res.json({
    mensajes: contactos,
  });
};

// consulta mensaje por su id
const recuperarContactoPorId = async (req, res, next) => {
  const idContacto = req.params.id;
  let contacto;
  try {
    contacto = await Contacto.findById(idContacto);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!contacto) {
    const error = new Error("No existe mensaje con el id propocionado");
    error.code = 404;
    return next(error);
  }
  res.json({
    mensaje: contacto,
  });
};

// eliminar mensaje del contacto por id
const eliminarContacto = async (req, res, next) => {
  const idContacto = req.params.id;
  let contacto;
  try {
    contacto = await Contacto.findById(idContacto);
  } catch (err) {
    const error = new Error(
      "ha habido alguna problema. no se ha podido recuperar los datos para eliminacion"
    );
    error.code = 500;
    return next(error);
  }
  if (!contacto) {
    const error = new Error(
      "no se ha podido localizar un mensaje del contacto con el id propocionado"
    );
    error.code = 404;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await contacto.remove({
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
    message: "mensaje del contacto eliminado",
  });
};

exports.crearContacto = crearContacto;
exports.recuperarTodosContactos = recuperarTodosContactos;
exports.recuperarContactoPorId = recuperarContactoPorId;
exports.eliminarContacto = eliminarContacto;
