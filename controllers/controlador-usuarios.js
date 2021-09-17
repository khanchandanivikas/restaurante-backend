const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongooseUniqueValidator = require("mongoose-unique-validator");
const { validationResult } = require("express-validator");
const Usuario = require("../models/usuario");
const Dato = require("../models/dato");
const Pedido = require("../models/pedido");

// crear nuevo usuario
const altaUsuario = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Error de validación. Compruebe sus datos");
    error.code = 422;
    return next(error);
  }
  const { nombre, email, password } = req.body;
  let existeUsuario;
  try {
    existeUsuario = await Usuario.findOne({
      email: email,
    });
  } catch (err) {
    const error = new Error("Ha habido un problema en la operación");
    error.code = 500;
    return next(error);
  }
  if (existeUsuario) {
    const error = new Error("Ya existe un usuario con ese e-mail");
    error.code = 401;
    return next(error);
  } else {
    let hashedPassword;
    hashedPassword = await bcrypt.hash(password, 12);
    const nuevoUsuario = new Usuario({
      nombre: nombre,
      email: email,
      password: hashedPassword,
    });
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await nuevoUsuario.save({
        session: sess,
      });
      await sess.commitTransaction();
    } catch (err) {
      const error = new Error("No se han podido guardar los datos");
      error.code = 500;
      return next(error);
    }
    let token;
    try {
      token = jwt.sign(
        {
          userId: nuevoUsuario.id,
          email: nuevoUsuario.email,
        },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );
    } catch (err) {
      const error = new Error("El proceso de alta ha fallado");
      error.code = 500;
      return next(error);
    }
    res.status(201).json({
      userId: nuevoUsuario.id,
      email: nuevoUsuario.email,
      dato: nuevoUsuario.dato,
      pedido: nuevoUsuario.pedido,
      token: token,
    });
  }
};

// recuperar todos los usuarios
const recuperarTodosUsuarios = async (req, res, next) => {
  let usuarios;
  try {
    usuarios = await Usuario.find({}, "-password").populate(["dato", "pedido"]);
  } catch (err) {
    const error = new Error("Error de validación. Compruebe sus datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    usuarios: usuarios,
  });
};

// login usuario
const loginUsuario = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Error de validación. Compruebe sus datos");
    error.code = 422;
    return next(error);
  }
  const { email, password } = req.body;
  let usuarioExiste;
  try {
    usuarioExiste = await Usuario.findOne({
      email: email,
    }).populate(["dato", "pedido"]);
  } catch (err) {
    const error = new Error("No se han podido guardar los datos");
    error.code = 500;
    return next(error);
  }
  if (!usuarioExiste) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales erróneos"
    );
    error.code = 422;
    return next(error);
  }
  let esValidoElPassword = false;
  try {
    esValidoElPassword = await bcrypt.compare(password, usuarioExiste.password);
  } catch (err) {
    const error = new Error(
      "No se ha realizar el login. Revise sus credenciales"
    );
    error.code = 500;
    return next(error);
  }
  if (!esValidoElPassword) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales error"
    );
    error.code = 401;
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      {
        userId: usuarioExiste.id,
        email: usuarioExiste.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    const error = new Error("El proceso de login ha fallado");
    error.code = 500;
    return next(error);
  }
  res.json({
    userId: usuarioExiste.id,
    email: usuarioExiste.email,
    dato: usuarioExiste.dato,
    pedido: usuarioExiste.pedido,
    token: token,
  });
};

// recuperar usuario por su id
const recuperarUsuarioPorId = async (req, res, next) => {
  const idUsuario = req.params.id;
  let usuario;
  try {
    usuario = await Usuario.findById(idUsuario).populate(["dato", "pedido"]);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!usuario) {
    const error = new Error(
      "No se ha podido encontrar un usuario con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    usuario: usuario,
  });
};

// eliminar usuario por id
const eliminarUsuario = async (req, res, next) => {
  const idUsuario = req.params.id;
  let usuario;
  try {
    usuario = await Usuario.findById(idUsuario).populate(["dato", "pedido"]);
  } catch (err) {
    const error = new Error(
      "ha habido alguna problema. no se ha podido recuperar los datos para eliminacion"
    );
    error.code = 500;
    return next(error);
  }
  if (!usuario) {
    const error = new Error(
      "no se ha podido localizar un usuario con el email propocionado"
    );
    error.code = 404;
    return next(error);
  }
  if (usuario.id !== req.userData.userId) {
    const error = new Error("No tiene permiso para eliminar este usuario");
    error.code = 401;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    usuario.dato.forEach(async (element) => {
      await Dato.findByIdAndRemove(element);
    });
    usuario.pedido.forEach(async (element) => {
      await Pedido.findByIdAndRemove(element);
    });
    await usuario.remove({
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
    message: "usuario eliminado",
  });
};

// modificar contraseña del usuario por id
const modificarUsuario = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Error de validación. Compruebe sus datos");
    error.code = 422;
    return next(error);
  }
  const { oldPassword, password } = req.body;
  const idUsuario = req.params.id;
  let usuario;
  try {
    usuario = await Usuario.findById(idUsuario);
  } catch (err) {
    const error = new Error(
      "Ha habido algún problema. No se ha podido actualizar la información del usuario"
    );
    error.code = 500;
    return next(error);
  }
  if (usuario.id !== req.userData.userId) {
    const error = new Error("No tiene permiso para eliminar este usuario");
    error.code = 401;
    return next(error);
  }
  let esValidoElPassword = false;
  try {
    esValidoElPassword = await bcrypt.compare(oldPassword, usuario.password);
  } catch (err) {
    const error = new Error(
      "No se ha realizar el login. Revise sus credenciales"
    );
    error.code = 500;
    return next(error);
  }
  if (!esValidoElPassword) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales error"
    );
    error.code = 401;
    return next(error);
  }
  let hashedPassword;
  hashedPassword = await bcrypt.hash(password, 12);
  usuario.password = hashedPassword;
  let token;
  try {
    token = jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    const error = new Error("El proceso de authenticacion ha fallado");
    error.code = 500;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await usuario.save({
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
    userId: usuario.id,
    email: usuario.email,
    token: token,
  });
};

exports.recuperarTodosUsuarios = recuperarTodosUsuarios;
exports.recuperarUsuarioPorId = recuperarUsuarioPorId;
exports.altaUsuario = altaUsuario;
exports.loginUsuario = loginUsuario;
exports.eliminarUsuario = eliminarUsuario;
exports.modificarUsuario = modificarUsuario;
