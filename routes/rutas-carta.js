const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const upload = require("../utils/multer");

const controladorCarta = require("../controllers/controlador-carta");

// consultar todas las cartas
router.get("/", controladorCarta.recuperarTodosCartas);

// consultar carta por categoria
router.get("/categoria/:categoria", controladorCarta.recuperarCartasPorCategoria);

// consultar carta por nombre del plato
router.get("/nombre/:nombre", controladorCarta.recuperarCartasPorNombre);

// crear nueva carta
router.post("/", upload.single("image"), controladorCarta.crearCarta);

// modificar precio del plato por su nombre
router.patch(
  "/:nombre",
  [check("precio").not().isEmpty()],
  controladorCarta.modificarCarta
);

// eliminar carta + imagen por nombre del plato
router.delete("/:nombre", controladorCarta.eliminarCarta);

module.exports = router;
