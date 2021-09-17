const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
require("dotenv").config();
const rutasBlog = require("./routes/rutas-blog");
const rutasContacto = require("./routes/rutas-contacto");
const rutasReservas = require("./routes/rutas-reservas");
const rutasNewsletter = require("./routes/rutas-newsletter");
const rutasCarta = require("./routes/rutas-carta");
const rutasUsuarios = require("./routes/rutas-usuarios");
const rutasDatos = require("./routes/rutas-datos");
const rutasPedidos = require("./routes/rutas-pedidos");
app.use("/api/blog", rutasBlog);
app.use("/api/contacto", rutasContacto);
app.use("/api/reservas", rutasReservas);
app.use("/api/newsletter", rutasNewsletter);
app.use("/api/carta", rutasCarta);
app.use("/api/usuarios", rutasUsuarios);
app.use("/api/datos", rutasDatos);
app.use("/api/pedidos", rutasPedidos);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || "ha occurido un error desconocido",
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("escuchando...");
    });
  })
  .catch((error) => {
    console.log("error" + error);
  });
