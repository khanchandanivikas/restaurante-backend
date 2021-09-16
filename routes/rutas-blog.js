const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const upload = require("../utils/multer");

const controladorBlog = require("../controllers/controlador-blog");

// crear nuevo blog
router.post("/", upload.single("image"), controladorBlog.crearBlog);

// consulta todos los blogs
router.get("/", controladorBlog.recuperarTodosBlogs);

// modificar descripcion del blog por id
router.patch(
  "/:id",
    [check("descripcion").not().isEmpty()],
  controladorBlog.modificarBlog
);

// eliminar blog + imagen por id
router.delete("/:id", controladorBlog.eliminarBlog);

module.exports = router;
