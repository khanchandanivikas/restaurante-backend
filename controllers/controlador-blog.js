const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const cloudinary = require("../utils/cloudinary");
const Blog = require("../models/blog");

// crear nuevo blog
const crearBlog = async (req, res, next) => {
  let result;
  try {
    result = await cloudinary.uploader.upload(req.file.path, {
      folder: "blog",
    });
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido guardar los datos"
    );
    error.code = 500;
    return next(error);
  }
  const nuevoBlog = new Blog({
    author: req.body.author,
    fecha: req.body.fecha,
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
    imagen: result.secure_url,
    cloudinary_id: result.public_id,
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await nuevoBlog.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error("No se han podido guardar los datos");
    error.code = 500;
    return next(error);
  }
  res.status(201).json({ blog: nuevoBlog });
};

// recuperar todos los blogs
const recuperarTodosBlogs = async (req, res, next) => {
  try {
    blogs = await Blog.find();
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!blogs) {
    const error = new Error("No existen blogs");
    error.code = 404;
    return next(error);
  }
  res.json({
    blogs: blogs,
  });
};

// modificar descripcion del blog por id
const modificarBlog = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("error de validacion, comprueba los datos");
    error.code = 422;
    return next(error);
  }
  const idBlog = req.params.id;
  const { descripcion } = req.body;
  let blog;
  try {
    blog = await Blog.findById(idBlog);
  } catch (err) {
    const error = new Error(
      "Ha habido algún problema. No se ha podido actualizar la información del blog"
    );
    error.code = 500;
    return next(error);
  }
  if (!blog) {
    const error = new Error("No existen datos");
    error.code = 404;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    blog.descripcion = descripcion;
    await blog.save({
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
  res.json({
    blog,
  });
};

// eliminar blog + imagen por su id
const eliminarBlog = async (req, res, next) => {
  const idBlog = req.params.id;
  let blog;
  try {
    blog = await Blog.findById(idBlog);
  } catch (err) {
    const error = new Error(
      "ha habido alguna problema. no se ha podido recuperar los datos para eliminacion"
    );
    error.code = 500;
    return next(error);
  }
  if (!blog) {
    const error = new Error(
      "no se ha podido localizar un blog con el id propocionado"
    );
    error.code = 404;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await cloudinary.uploader.destroy(blog.cloudinary_id);
    await blog.remove({
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
    message: "blog eliminado",
  });
};

exports.crearBlog = crearBlog;
exports.recuperarTodosBlogs = recuperarTodosBlogs;
exports.modificarBlog = modificarBlog;
exports.eliminarBlog = eliminarBlog;
