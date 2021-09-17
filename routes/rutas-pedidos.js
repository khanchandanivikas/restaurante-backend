const express = require("express");
const { check } = require("express-validator");
const controladorPedidos = require("../controllers/controlador-pedidos");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

// consulta todos los Pedidos
router.get("/", controladorPedidos.recuperarTodosPedidos);

// consulta por id
router.get("/:id", controladorPedidos.recuperarPedidoPorId);

// consulta por pedidos por id del usuario los pedidos que son de un usuario
router.get("/idUsuario/:uid", controladorPedidos.recuperarPedidosPorIdUsuario);

router.use(checkAuth);

// crear nuevo Pedido
router.post(
  "/",
  [
    check("fecha").not().isEmpty(),
    check("productos").not().isEmpty(),
    check("usuario").not().isEmpty(),
  ],
  controladorPedidos.crearPedido
);

// modificar cantidad del Pedido por su id y id del producto del pedido
router.patch(
  "/:peid/:prid",
  [check("cantidad").not().isEmpty(), check("cantidad").isNumeric()],
  controladorPedidos.modificarPedido
);

// eliminar Pedido por id
router.delete("/:id", controladorPedidos.eliminarPedido);

module.exports = router;
