const express = require("express");
const Sequelize = require('sequelize');
const { Film } = require("./db");
const { check, validationResult } = require("express-validator");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Middleware to check headers for email
app.use([check("email").isEmail()], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors
        .array()
        .map((error) => ({ ...error, msg: "Некорректный email" })),
    });
  }
  req.email = req.headers.email;
  next();
});

app.get("/films", async (req, res) => {
  // Set up the query options
  let queryOptions = { where: { email: req.email } };

  // Handle filtering by genre
  if (req.query.genre) {
    queryOptions.where.genre = {
      [Sequelize.Op.iLike]: "%" + req.query.genre + "%",
    };
  }

  // Handle filtering by title
  if (req.query.title) {
    queryOptions.where.title = {
      [Sequelize.Op.iLike]: "%" + req.query.title + "%",
    };
  }

  // Handle filtering by isWatched
  if (req.query.isWatched) {
    queryOptions.where.isWatched = req.query.isWatched === "true";
  }

  const films = await Film.findAll(queryOptions);
  res.json(films);
});

app.post(
  "/films",
  [
    check("title").notEmpty(),
    check("genre").notEmpty(),
    check("releaseYear").notEmpty(),
    check("isWatched").isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors
          .array()
          .map((error) => ({ ...error, msg: "Некорректные данные" })),
      });
    }

    const filmCount = await Film.count({ where: { email: req.email } });
    if (filmCount >= 200) {
      return res
        .status(400)
        .json({ error: "Превышено максимальное количество фильмов" });
    }

    try {
      const film = await Film.create({ ...req.body, email: req.email });
      res.json(film);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          error: "Фильм с таким названием и годом выпуска уже существует",
        });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.delete("/films/:id", async (req, res) => {
  await Film.destroy({ where: { id: req.params.id, email: req.email } });
  res.json({ message: "Фильм удалён" });
});

app.delete("/films", async (req, res) => {
  await Film.destroy({ where: { email: req.email } });
  res.json({ message: "Все фильмы удалены для данного email" });
});

app.listen(port, () => {
  console.log(`Сервер работает на порту ${port}`);
});
