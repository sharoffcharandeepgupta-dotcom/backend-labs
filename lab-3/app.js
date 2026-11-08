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
  }
};


app.get("/about/", (request, response) => {
  response.send("This is Lab 3 - REST API Development");
});

app.get("/", (request, response) => {
  response.send("Welcome to Lab 3 - REST API");
});


app.get("/books/", async (request, response) => {
  try {
    let search = request.query.search_q;
    let orderBy = request.query.order_by;
    let order = request.query.order;
    let limit = request.query.limit;
    let offset = request.query.offset;
    let minPrice = request.query.min_price;
    let maxPrice = request.query.max_price;


    if (search === undefined) {
      search = "";
    }

    if (orderBy === undefined) {
      orderBy = "title";
    }

    if (order === undefined) {
      order = "ASC";
    }

    if (limit === undefined) {
      limit = 10;
    }

    if (offset === undefined) {
      offset = 0;
    }


    if (
      orderBy !== "id" &&
      orderBy !== "title" &&
      orderBy !== "author" &&
      orderBy !== "price" &&
      orderBy !== "pages"
    ) {
      return response.status(400).send({
        message: "Invalid order_by value"
      });
    }

    order = order.toUpperCase();

    if (order !== "ASC" && order !== "DESC") {
      return response.status(400).send({
        message: "Order must be ASC or DESC"
      });
    }


    let query = "SELECT * FROM book WHERE title LIKE ?";
    let values = ["%" + search + "%"];

    if (minPrice !== undefined) {
      query = query + " AND price >= ?";
      values.push(minPrice);
    }


    if (maxPrice !== undefined) {
      query = query + " AND price <= ?";
      values.push(maxPrice);
    }

    query = query + " ORDER BY " + orderBy + " " + order;
    query = query + " LIMIT ? OFFSET ?";

    values.push(Number(limit));
    values.push(Number(offset));

    const books = await db.all(query, values);

    response.status(200).send(books);
  } catch (error) {
    response.status(500).send({
      error: error.message
    });
  }
});

app.get("/books/:bookId/", async (request, response) => {
  try {
    const bookId = request.params.bookId;

    const query = `
      SELECT * FROM book
      WHERE id = ?;
    `;

    const book = await db.get(query, bookId);

    if (book === undefined) {
      response.status(404).send({
        message: "Book not found"
      });
    } else {
      response.status(200).send(book);
    }
  } catch (error) {
    response.status(500).send({
      error: error.message
    });
  }
});

app.post("/books/", async (request, response) => {
  try {
    const title = request.body.title;
    const author = request.body.author;
    const price = request.body.price;
    const pages = request.body.pages;

    // Validate request body
    if (
      title === undefined ||
      title === "" ||
      author === undefined ||
      author === "" ||
      price === undefined ||
      price === "" ||
      isNaN(price)
    ) {
      return response.status(400).send({
        message: "Title, author, and numeric price are required"
      });
    }

    const query = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(
      query,
      title,
      author,
      price,
      pages
    );

    response.status(201).send({
      message: "Book added successfully",
      bookId: result.lastID
    });
  } catch (error) {
    response.status(500).send({
      error: error.message
    });
  }
});


app.put("/books/:bookId/", async (request, response) => {
  try {
    const bookId = request.params.bookId;

    const title = request.body.title;
    const author = request.body.author;
    const price = request.body.price;
    const pages = request.body.pages;

    if (
      title === undefined ||
      title === "" ||
      author === undefined ||
      author === "" ||
      price === undefined ||
      price === "" ||
      isNaN(price)
    ) {
      return response.status(400).send({
        message: "Title, author, and numeric price are required"
      });
    }

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
      response.status(404).send({
        message: "Book not found"
      });
    } else {
      response.status(200).send({
        message: "Book updated successfully"
      });
    }
  } catch (error) {
    response.status(500).send({
      error: error.message
    });
  }
});

app.delete("/books/:bookId/", async (request, response) => {
  try {
    const bookId = request.params.bookId;

    const query = `
      DELETE FROM book
      WHERE id = ?;
    `;

    const result = await db.run(query, bookId);

    if (result.changes === 0) {
      response.status(404).send({
        message: "Book not found"
      });
    } else {
      response.status(200).send({
        message: "Book deleted successfully"
      });
    }
  } catch (error) {
    response.status(500).send({
      error: error.message
    });
  }
});


initializeDBAndServer();

module.exports = app;