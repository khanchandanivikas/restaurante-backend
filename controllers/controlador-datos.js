const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Usuario = require("../models/usuario");
const Dato = require("../models/dato");
const Pedido = require("../models/pedido");

// recuperar todos los datos
const recuperarTodosDatos = async (req, res, next) => {
  try {
    datos = await Dato.find().populate("usuario");
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    console.log(err);
    return next(error);
  }
  if (!datos) {
    const error = new Error("No se ha podido recuperar los datos");
    error.code = 404;
    return next(error);
  }
  res.json({
    datos: datos,
  });
};

// crear nuevo dato
const crearDato = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Error de validación. Compruebe sus datos");
    error.code = 422;
    return next(error);
  }
  const { region, direccion, provincia, cuidad, cp, telefono, usuario } =
    req.body;
  const nuevoDato = new Dato({
    region,
    direccion,
    provincia,
    cuidad,
    cp,
    telefono,
    usuario,
  });
  let usuarioRelacionado;
  try {
    usuarioRelacionado = await Usuario.findById(usuario).populate([
      "dato",
      "pedido",
    ]);
  } catch (error) {
    const err = new Error("Ha fallado la creación del dato");
    err.code = 500;
    return next(err);
  }
  if (!usuarioRelacionado) {
    const error = new Error(
      "No se ha podido encontrar un usuario con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  if (usuarioRelacionado.id.toString() !== req.userData.userId) {
    const err = new Error("No tiene permiso para crear este dato");
    err.code = 401;
    return next(err);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await nuevoDato.save({
      session: sess,
    });
    usuarioRelacionado.dato.push(nuevoDato);
    await usuarioRelacionado.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error);
    const err = new Error("No se han podido guardar los datos");
    err.code = 500;
    return next(err);
  }
  res.status(201).json({
    dato: nuevoDato,
  });
};

// consulta dato por su id
const recuperarDatoPorId = async (req, res, next) => {
  const idDato = req.params.id;
  let dato;
  try {
    dato = await Dato.findById(idDato).populate("usuario");
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!dato) {
    const error = new Error(
      "No se ha podido encontrar un dato con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    dato: dato,
  });
};

// recuperar dato por id del usuario
const recuperarDatoPorIdUsuario = async (req, res, next) => {
  const idUsuario = req.params.uid;
  let dato;
  try {
    dato = await Dato.find({
      usuario: idUsuario,
    });
  } catch (err) {
    const error = new Error(
      "Ha fallado la recuperación. Inténtelo de nuevo más tarde"
    );
    error.code = 500;
    return next(error);
  }

  if (!dato || dato.length === 0) {
    const error = new Error(
      "No se han podido encontrar dato para el usuario proporcionado"
    );
    error.code = 404;
    return next(error);
  } else {
    res.json({
      dato,
    });
  }
};

// modificar dato por id
const modificarDato = async (req, res, next) => {
  const idDato = req.params.id;
  let dato;
  try {
    dato = await Dato.findById(idDato);
  } catch (error) {
    const err = new Error(
      "Ha habido algún problema. No se ha podido actualizar la información del dato"
    );
    err.code = 500;
    return next(err);
  }
  if (dato.usuario.toString() !== req.userData.userId) {
    const err = new Error("No tiene permiso para modifcar este dato");
    err.code = 401;
    return next(err);
  }
  dato = Object.assign(dato, req.body);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await dato.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (error) {
    const err = new Error(
      "Ha habido algún problema. No se ha podido guardar la información actualizada"
    );
    err.code = 500;
    return next(err);
  }
  res.status(200).json({
    dato,
  });
};

exports.crearDato = crearDato;
exports.recuperarTodosDatos = recuperarTodosDatos;
exports.recuperarDatoPorId = recuperarDatoPorId;
exports.recuperarDatoPorIdUsuario = recuperarDatoPorIdUsuario;
exports.modificarDato = modificarDato;
