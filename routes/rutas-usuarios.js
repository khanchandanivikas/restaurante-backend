const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

const controladorUsuarios = require("../controllers/controlador-usuarios");

// crear nuevo usuario o alta usuario
router.post(
  "/",
  [
    check("nombre").not().isEmpty(),
    check("email").not().isEmpty(),
    check("password").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  controladorUsuarios.altaUsuario
);

// consulta todos los Usuarios
router.get("/", controladorUsuarios.recuperarTodosUsuarios);

// consulta usuario por su id
router.get("/:id", controladorUsuarios.recuperarUsuarioPorId);

// login usuario
router.post(
  "/login",
  [
    check("email").not().isEmpty(),
    check("password").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  controladorUsuarios.loginUsuario
);

router.use(checkAuth);

// modificar contraseña del usuario por id
router.patch(
  "/:id",
  [check("password").not().isEmpty(), check("password").isLength({ min: 6 })],
  controladorUsuarios.modificarUsuario
);

// eliminar usuario por id mas todos pedidos y datos relacionado
router.delete("/:id", controladorUsuarios.eliminarUsuario);

module.exports = router;
