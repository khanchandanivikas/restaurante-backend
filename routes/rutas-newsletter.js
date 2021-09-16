const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const controladorNewsletters = require("../controllers/controlador-newsletter");

// alta newsletter
router.post(
  "/",
  [check("email").not().isEmpty(), check("email").normalizeEmail().isEmail()],
  controladorNewsletters.altaNewsletter
);

// consulta todos los newsletters
router.get("/", controladorNewsletters.recuperarTodosNewsletters);

// consulta newsletter por email
router.get("/:email", controladorNewsletters.recuperarNewsletterPorEmail);

// dar baja a newsletter por email
router.delete("/:email", controladorNewsletters.eliminarNewsletter);

module.exports = router;
