const express = require("express");
const openDatabase = require("./database");

const app = express();

app.use(express.json());

let db;

const initializeDBAndServer = async () => {
  try {
    db = await openDatabase();

    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    console.log("Book table created successfully");

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Database error: ${error.message}`);
    process.exit(1);
  }
};

app.get("/", (request, response) => {
  response.send(`
    <h1>Welcome to Backend Fundamentals - Lab 2</h1>

    <p>
      This project demonstrates connecting an Express.js
      application with an SQLite database and performing
      CRUD operations on book records.
    </p>

    <h2>Available API Endpoints</h2>

    <h3>GET /books/</h3>
    <p>Retrieve all books from the database.</p>

    <h3>GET /books/:bookId/</h3>
    <p>Retrieve a specific book using its ID.</p>

    <h3>POST /books/</h3>
    <p>Add a new book to the database.</p>

    <h3>PUT /books/:bookId/</h3>
    <p>Update an existing book using its ID.</p>

    <h3>DELETE /books/:bookId/</h3>
    <p>Delete a book using its ID.</p>

    <p>Server Status: Running</p>
  `);
});

app.get("/books/", async (request, response) => {
  try {
    const query = `
      SELECT * FROM book;
    `;

    const books = await db.all(query);

    response.status(200).send(books);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const query = `
      SELECT * FROM book
      WHERE id = ?;
    `;

    const book = await db.get(query, bookId);

    if (book === undefined) {
      response.status(404).send({ message: "Book not found" });
    } else {
      response.status(200).send(book);
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    const query = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(query, title, author, price, pages);

    response.status(201).send({
      message: "Book added successfully",
      bookId: result.lastID
    });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const query = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    const result = await db.run(
      query,
      title,
      author,
      price,
      pages,
      bookId
    );

    if (result.changes === 0) {
      response.status(404).send({ message: "Book not found" });
    } else {
      response.status(200).send({ message: "Book updated successfully" });
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const query = `
      DELETE FROM book
      WHERE id = ?;
    `;

    const result = await db.run(query, bookId);

    if (result.changes === 0) {
      response.status(404).send({ message: "Book not found" });
    } else {
      response.status(200).send({ message: "Book deleted successfully" });
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

initializeDBAndServer();

module.exports = app;
