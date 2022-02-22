const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

// CONFIG DO SERVIDOR
const { Pool } = require("pg");
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "evernoteclone",
    password: "123456",
    port: 5432
  });
console.log('Servidor aberto com sucesso!');

app.listen(3000, () => { {
  console.log("Server started (http://localhost:3000/) !");
}});

// VISUALIZANDO TODAS AS NOTAS CRIADAS
app.get("/", (req, res) => {
  const sql = "SELECT * FROM notes ORDER BY title"
  pool.query(sql, [], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("index", { model: result.rows });
  });
});

// VISUALIZANDO AS CATEGORIAS EXISTENTES
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM categories ORDER BY nome"
  pool.query(sql, [], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("categories", { model: result.rows });
  });
});

app.get("/categories/:id", (req, res) => {
  const note = [req.body.category_id];
  const sql = "SELECT * FROM notes WHERE category_id = $1";
  pool.query(sql, note, (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("index", { model: result.rows });
  });
});

// VISUALIZANDO AS TAGS EXISTENTES
app.get("/tags", (req, res) => {
  const sql = "SELECT * FROM tags ORDER BY nome"
  pool.query(sql, [], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("tags", { model: result.rows });
  });
});

// EDITANDO AS NOTAS
app.get("/:id/edit", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM notes WHERE note_id = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("edit", { model: result.rows[0] });
  });
});

app.post("/:id/edit", (req, res) => {
  const id = req.params.id;
  const note = [req.body.category_id, req.body.title, req.body.corpo, id];
  const sql = "UPDATE notes SET category_id = $1, title = $2, corpo = $3, updated_at = current_timestamp WHERE note_ID = $4";
  pool.query(sql, note, (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/");
  });
});

// CRIANDO AS NOTAS
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

app.post("/create", (req, res) => {
  const sql = "INSERT INTO Notes (category_id, title, corpo, created_at) VALUES ($1, $2, $3, current_timestamp)";
  const notes = [req.body.category_id, req.body.title, req.body.corpo];
  pool.query(sql, notes, (err, result) => {
    if (err) {
      return console.error(err.message);
    } 
    if (req.body.hasOwnProperty('tags')) {
      let sql2 = 'INSERT INTO note_tag (note_id_fk, tag_id_fk) VALUES';
      for (let i = 0; req.body.tags.length > i; i++){
        if (i > 0) {
          sql2 = `${sql2}, `;
        }
        sql2 = `${sql2} (note_id, ${req.body.tags[i]})`;
      } 
      //res.status(200).send({'tags':req.body.tags, 'sql':sql2, 'comprimento':req.body.tags.length});
    }
  });
});

// DELETANDO AS NOTAS
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM notes WHERE note_id = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("delete", { model: result.rows[0] });
  });
});

app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM notes WHERE note_id = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.redirect("/");
  });
});

// VISUALIZANDO AS NOTAS
app.get("/visualizar/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM notes WHERE note_id = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("visualizar", { model: result.rows[0] });
  });
});