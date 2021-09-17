const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Reserva = require("../models/reserva");

// recuperar todas las reservas
const recuperarTodosReservas = async (req, res, next) => {
  try {
    reservas = await Reserva.find();
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!reservas) {
    const error = new Error("No existen reservas");
    error.code = 404;
    return next(error);
  }
  res.json({
    reservas: reservas,
  });
};

// consulta reserva por id
const recuperarReservaPorId = async (req, res, next) => {
  const idReserva = req.params.id;
  let reserva;
  try {
    reserva = await Reserva.findById(idReserva);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!reserva) {
    const error = new Error("No existe reserva con este id");
    error.code = 404;
    return next(error);
  }
  res.json({
    reserva: reserva,
  });
};

// consulta de reservas por una fecha
const recuperarReservaPorFecha = async (req, res, next) => {
  const fechaReserva = req.params.fecha;
  let reserva;
  try {
    reserva = await Reserva.find({ fecha: { $eq: fechaReserva } });
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!reserva) {
    const error = new Error("No existe reservas con este fecha");
    error.code = 404;
    return next(error);
  }
  res.json({
    reserva: reserva,
  });
};

// crear nueva reserva
const crearReserva = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Error de validación. Compruebe sus datos");
    error.code = 422;
    return next(error);
  }
  const { nombre, email, fecha, hora, comensales } = req.body;
  const nuevaReserva = new Reserva({
    nombre,
    email,
    fecha,
    hora,
    comensales,
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await nuevaReserva.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error("No se han podido guardar los datos");
    error.code = 500;
    return next(error);
  }
  res.status(201).json({
    reserva: nuevaReserva,
  });
};

// modificar reserva por id
const modificarReserva = async (req, res, next) => {
  const idReserva = req.params.id;
  let reserva;
  try {
    reserva = await Reserva.findById(idReserva);
  } catch (err) {
    const error = new Error(
      "Ha habido algún problema. No se ha podido actualizar la información de la reserva"
    );
    error.code = 500;
    return next(error);
  }
  reserva = Object.assign(reserva, req.body);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await reserva.save({
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
  res.status(200).json({
    reserva,
  });
};

// eliminar reserva por id
const eliminarReserva = async (req, res, next) => {
  const idReserva = req.params.id;
  let reserva;
  try {
    reserva = await Reserva.findById(idReserva);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos para eliminación"
    );
    error.code = 500;
    return next(error);
  }
  if (!reserva) {
    const error = new Error(
      "No se ha podido encontrar una reserva con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await reserva.remove({
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
    message: "reserva eliminada",
  });
};

exports.recuperarTodosReservas = recuperarTodosReservas;
exports.recuperarReservaPorId = recuperarReservaPorId;
exports.recuperarReservaPorFecha = recuperarReservaPorFecha;
exports.crearReserva = crearReserva;
exports.modificarReserva = modificarReserva;
exports.eliminarReserva = eliminarReserva;
