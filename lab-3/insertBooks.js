const openDatabase = require("./database");
const fs = require("fs");

const insertBooks = async () => {
  const db = await openDatabase();

  const data = fs.readFileSync("./books.json", "utf8");
  const books = JSON.parse(data);

  for (let i = 0; i < books.length; i++) {
    const book = books[i];

    await db.run(
      `INSERT INTO book (title, author, price, pages)
       VALUES (?, ?, ?, ?)`,
      book.title,
      book.author,
      book.price,
      book.pages
    );
  }

  console.log("All books added successfully");

  await db.close();
};

insertBooks();