const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const controladorContactos = require("../controllers/controlador-contacto");

// recibir nuevo mensaje
router.post(
  "/",
  [
    check("tipo").not().isEmpty(),
    check("genero").not().isEmpty(),
    check("nombre").not().isEmpty(),
    check("correo").not().isEmpty(),
    check("mensaje").not().isEmpty(),
    check("correo").normalizeEmail().isEmail(),
    check("correo").isLength({ min: 6 }),
    check("mensaje").isLength({ min: 5 }),
  ],
  controladorContactos.crearContacto
);

// consulta todos los mensajes
router.get("/", controladorContactos.recuperarTodosContactos);

// consulta mensaje por su id
router.get("/:id", controladorContactos.recuperarContactoPorId);

// eliminar mensaje del contacto por id
router.delete("/:id", controladorContactos.eliminarContacto);

module.exports = router;
