const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

const controladorDatos = require("../controllers/controlador-datos");

// consulta todos los Datos
router.get("/", controladorDatos.recuperarTodosDatos);

// consulta por id
router.get("/:id", controladorDatos.recuperarDatoPorId);

// consulta por id del usuario
router.get("/idUsuario/:uid", controladorDatos.recuperarDatoPorIdUsuario);

router.use(checkAuth);

// crear nuevo Dato
router.post(
  "/",
  [
    check("region").not().isEmpty(),
    check("direccion").not().isEmpty(),
    check("provincia").not().isEmpty(),
    check("cuidad").not().isEmpty(),
    check("cp").not().isEmpty(),
    check("telefono").not().isEmpty(),
    check("usuario").not().isEmpty(),
    check("cp").isNumeric(),
    check("telefono").isNumeric(),
    check("telefono").isLength({ min: 5 }),
    check("cp").isLength({ min: 3 }),
  ],
  controladorDatos.crearDato
);

// modificar Dato por id
router.patch("/:id", controladorDatos.modificarDato);


module.exports = router;
