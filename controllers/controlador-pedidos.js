const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Usuario = require("../models/usuario");
const Dato = require("../models/dato");
const Pedido = require("../models/pedido");

// recuperar todos los pedidos
const recuperarTodosPedidos = async (req, res, next) => {
  try {
    pedidos = await Pedido.find().populate("usuario");
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    console.log(err);
    error.code = 500;
    return next(error);
  }
  if (!pedidos) {
    const error = new Error("No se ha podido recuperar los datos");
    error.code = 404;
    return next(error);
  }
  res.json({
    pedidos: pedidos,
  });
};

// crear nuevo pedido
const crearPedido = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Error de validación. Compruebe sus datos");
    error.code = 422;
    return next(error);
  }
  const { fecha, productos, usuario } = req.body;
  const nuevoPedido = new Pedido({
    fecha: fecha,
    productos: productos,
    usuario: usuario,
  });
  let usuarioRelacionado;
  try {
    usuarioRelacionado = await Usuario.findById(usuario).populate([
      "dato",
      "pedido",
    ]);
  } catch (error) {
    const err = new Error("Ha fallado la creación del pedido");
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
  if (usuarioRelacionado.id !== req.userData.userId) {
    const err = new Error("No tiene permiso para crear este pedido");
    console.log(err);
    comsole.log(usuarioRelacionado);
    err.code = 401;
    return next(err);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await nuevoPedido.save({
      session: sess,
    });
    usuarioRelacionado.pedido.push(nuevoPedido);
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
    pedido: nuevoPedido,
  });
};

// recuperar pedido por su id
const recuperarPedidoPorId = async (req, res, next) => {
  const idPedido = req.params.id;
  let pedido;
  try {
    pedido = await Pedido.findById(idPedido);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!pedido) {
    const error = new Error(
      "No se ha podido encontrar un pedido con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    pedido: pedido,
  });
};

// consultar por id del usuario los pedidos de un usuario
const recuperarPedidosPorIdUsuario = async (req, res, next) => {
  const idUsuario = req.params.uid;
  let pedidos;
  try {
    pedidos = await Pedido.find({
      usuario: idUsuario,
    });
  } catch (err) {
    const error = new Error(
      "Ha fallado la recuperación. Inténtelo de nuevo más tarde"
    );
    error.code = 500;
    return next(error);
  }
  if (!pedidos || pedidos.length === 0) {
    const error = new Error(
      "No se han podido encontrar pedido para el usuario proporcionado"
    );
    error.code = 404;
    return next(error);
  } else {
    res.json({
      pedidos,
    });
  }
};

// eliminar pedido por id
const eliminarPedido = async (req, res, next) => {
  const idPedido = req.params.id;
  let pedido;
  try {
    pedido = await Pedido.findById(idPedido).populate("usuario");
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos para eliminación"
    );
    error.code = 500;
    return next(error);
  }
  if (!pedido) {
    const error = new Error(
      "No se ha podido encontrar un pedido con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  if (pedido.usuario.id !== req.userData.userId) {
    const error = new Error("No tiene permiso para eliminar este pedido");
    error.code = 401;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await pedido.remove({
      session: sess,
    });
    await pedido.usuario.pedido.pull(pedido);
    await pedido.usuario.save({
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
    message: "pedido eliminado",
  });
};

// modificar cantidad del pedido por id del pedido y id del cart
const modificarPedido = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Error de validación. Compruebe sus datos");
    error.code = 422;
    return next(error);
  }
  const { cantidad } = req.body;
  const idPedido = req.params.peid;
  let pedido;
  try {
    pedido = await Pedido.findById(idPedido);
  } catch (error) {
    const err = new Error(
      "1Ha habido algún problema. No se ha podido actualizar la información del pedido"
    );
    err.code = 500;
    return next(err);
  }
  const idProducto = req.params.prid;
  let producto;
  try {
    producto = await pedido.productos.find((element) => {
      return element.id === idProducto;
    });
  } catch (error) {
    const err = new Error(
      "2Ha habido algún problema. No se ha podido actualizar la información del pedido"
    );
    console.log(error);
    err.code = 500;
    return next(err);
  }
  if (!pedido || !producto) {
    const error = new Error(
      "No se ha podido encontrar un pedido con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  if (pedido.usuario.toString() !== req.userData.userId) {
    const err = new Error("No tiene permiso para modifcar este pedido");
    err.code = 401;
    return next(err);
  }
  producto.cantidad = cantidad;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await pedido.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (error) {
    const err = new Error(
      "3Ha habido algún problema. No se ha podido guardar la información actualizada"
    );
    err.code = 500;
    return next(err);
  }
  res.json({
    pedido,
  });
};

exports.crearPedido = crearPedido;
exports.recuperarTodosPedidos = recuperarTodosPedidos;
exports.eliminarPedido = eliminarPedido;
exports.recuperarPedidoPorId = recuperarPedidoPorId;
exports.recuperarPedidosPorIdUsuario = recuperarPedidosPorIdUsuario;
exports.modificarPedido = modificarPedido;
