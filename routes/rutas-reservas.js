const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const controladorReservas = require("../controllers/controlador-reservas");

// consultar todas las reservas
router.get("/", controladorReservas.recuperarTodosReservas);

// consulta por id
router.get("/:id", controladorReservas.recuperarReservaPorId);

// consulta de reservas por una fecha
router.get("/fechaReserva/:fecha", controladorReservas.recuperarReservaPorFecha);

// crear nueva reserva
router.post(
  "/",
  [
    check("nombre").not().isEmpty(),
    check("email").not().isEmpty(),
    check("fecha").not().isEmpty(),
    check("hora").not().isEmpty(),
    check("comensales").not().isEmpty(),
    check("comensales").isNumeric(),
    check("comensales").isLength({ min: 1 }),
    check("email").isLength({ min: 6 }),
  ],
  controladorReservas.crearReserva
);

// modificar reserva por su id
router.patch("/:id", controladorReservas.modificarReserva);

// eliminar reserva por id
router.delete("/:id", controladorReservas.eliminarReserva);

module.exports = router;
