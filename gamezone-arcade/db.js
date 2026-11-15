const path = require("node:path");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const databasePath = path.join(__dirname, "gameZone.db");

async function initializeDatabase() {
  const db = await sqlite.open({
    filename: databasePath,
    driver: sqlite3.Database
  });

  await db.exec("PRAGMA foreign_keys = ON");
  await db.exec(`
    CREATE TABLE IF NOT EXISTS gamers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS consoles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      platform TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gamer_id INTEGER NOT NULL,
      console_id INTEGER NOT NULL,
      booking_date TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (gamer_id) REFERENCES gamers(id),
      FOREIGN KEY (console_id) REFERENCES consoles(id)
    );
  `);

  const counts = await Promise.all([
    db.get("SELECT COUNT(*) AS count FROM gamers"),
    db.get("SELECT COUNT(*) AS count FROM consoles"),
    db.get("SELECT COUNT(*) AS count FROM bookings")
  ]);

  if (counts.every((row) => row.count === 0)) {
    await db.exec("BEGIN");
    try {
      await db.run("INSERT INTO gamers (name, email) VALUES (?, ?)", "Alex Morgan", "alex.morgan@example.com");
      await db.run("INSERT INTO gamers (name, email) VALUES (?, ?)", "Jamie Lee", "jamie.lee@example.com");
      await db.run("INSERT INTO consoles (name, platform) VALUES (?, ?)", "PlayStation 5", "Sony");
      await db.run("INSERT INTO consoles (name, platform) VALUES (?, ?)", "Xbox Series X", "Microsoft");
      await db.run(
        "INSERT INTO bookings (gamer_id, console_id, booking_date, status) VALUES (?, ?, ?, ?)",
        1,
        1,
        "2026-11-20",
        "Confirmed"
      );
      await db.run(
        "INSERT INTO bookings (gamer_id, console_id, booking_date, status) VALUES (?, ?, ?, ?)",
        2,
        2,
        "2026-11-21",
        "Pending"
      );
      await db.exec("COMMIT");
    } catch (error) {
      await db.exec("ROLLBACK");
      throw error;
    }
  }

  return db;
}

module.exports = { initializeDatabase };
