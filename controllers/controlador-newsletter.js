const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Newsletter = require("../models/newsletter");

// alta newsletter
const altaNewsletter = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Error de validación. Compruebe sus datos");
    error.code = 422;
    return next(error);
  }
  const { email } = req.body;
  let existeUsuario;
  try {
    existeUsuario = await Newsletter.findOne({
      email: email,
    });
  } catch (err) {
    const error = new Error("Ha habido un problema en la operación");
    error.code = 500;
    return next(error);
  }
  if (existeUsuario) {
    const error = new Error("Ya existe una alta con ese e-mail");
    error.code = 401;
    return next(error);
  } else {
    const nuevoNewsletter = new Newsletter({
      email: email,
    });
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await nuevoNewsletter.save({
        session: sess,
      });
      await sess.commitTransaction();
    } catch (err) {
      const error = new Error("No se han podido guardar los datos");
      error.code = 500;
      return next(error);
    }
    res.status(201).json({
      newsletter: nuevoNewsletter,
    });
  }
};

// recuperar todos los newsletters
const recuperarTodosNewsletters = async (req, res, next) => {
  try {
    newsletters = await Newsletter.find();
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!newsletters) {
    const error = new Error("No existen newsletters");
    error.code = 404;
    return next(error);
  }
  res.json({
    newsletters: newsletters,
  });
};

// consulta newsletter por email
const recuperarNewsletterPorEmail = async (req, res, next) => {
  const emailUsuario = req.params.email;
  let newsletter;
  try {
    newsletter = await Newsletter.findOne({ email: { $eq: emailUsuario } });
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!newsletter) {
    const error = new Error("No existe newsletter con este email");
    error.code = 404;
    return next(error);
  }
  res.json({
    newsletter: newsletter,
  });
};

// dar baja a newsletter por email
const eliminarNewsletter = async (req, res, next) => {
  const emailUsuario = req.params.email;
  let newsletter;
  try {
    newsletter = await Newsletter.findOne({ email: { $eq: emailUsuario } });
  } catch (err) {
    const error = new Error(
      "ha habido alguna problema. no se ha podido recuperar los datos para eliminacion"
    );
    error.code = 500;
    return next(error);
  }
  if (!newsletter) {
    const error = new Error(
      "no se ha podido localizar un newsletter con el email propocionado"
    );
    error.code = 404;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newsletter.remove({
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
    message: "baja al newsletter exitoso",
  });
};

exports.recuperarTodosNewsletters = recuperarTodosNewsletters;
exports.recuperarNewsletterPorEmail = recuperarNewsletterPorEmail;
exports.altaNewsletter = altaNewsletter;
exports.eliminarNewsletter = eliminarNewsletter;
