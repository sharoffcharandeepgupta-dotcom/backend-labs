const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'gameZone.db')
let db = null

const initializeDBAndServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  await db.exec('PRAGMA foreign_keys = ON;')

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Gamers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Consoles (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      platform TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Bookings (
      id INTEGER PRIMARY KEY,
      gamer_id INTEGER NOT NULL,
      console_id INTEGER NOT NULL,
      booking_date TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (gamer_id) REFERENCES Gamers (id),
      FOREIGN KEY (console_id) REFERENCES Consoles (id)
    );
  `)

  await db.run(
    'INSERT OR IGNORE INTO Gamers (id, name, email) VALUES (?, ?, ?)',
    [1, 'Alex Morgan', 'alex@example.com'],
  )
  await db.run(
    'INSERT OR IGNORE INTO Gamers (id, name, email) VALUES (?, ?, ?)',
    [2, 'Jamie Lee', 'jamie@example.com'],
  )
  await db.run(
    'INSERT OR IGNORE INTO Consoles (id, name, platform) VALUES (?, ?, ?)',
    [1, 'GameZone Console X', 'PlayStation'],
  )
  await db.run(
    'INSERT OR IGNORE INTO Consoles (id, name, platform) VALUES (?, ?, ?)',
    [2, 'GameZone Console Pro', 'Xbox'],
  )
  await db.run(
    `INSERT OR IGNORE INTO Bookings
      (id, gamer_id, console_id, booking_date, status)
      VALUES (?, ?, ?, ?, ?)`,
    [1, 1, 1, '2026-11-20', 'Confirmed'],
  )
  await db.run(
    `INSERT OR IGNORE INTO Bookings
      (id, gamer_id, console_id, booking_date, status)
      VALUES (?, ?, ?, ?, ?)`,
    [2, 2, 2, '2026-11-21', 'Pending'],
  )

  app.listen(3000, () => {
    console.log('Server running at http://localhost:3000/')
  })
}

initializeDBAndServer().catch(error => {
  console.error('Unable to start the server:', error.message)
  process.exit(1)
})

// API 1: Get all gamers
app.get('/gamers/', async (request, response) => {
  const gamers = await db.all('SELECT * FROM Gamers ORDER BY id')
  response.send(gamers)
})

// API 2: Get one gamer
app.get('/gamers/:gamerId/', async (request, response) => {
  const {gamerId} = request.params
  const gamer = await db.get('SELECT * FROM Gamers WHERE id = ?', [gamerId])

  if (gamer === undefined) {
    response.status(404).send({message: 'Gamer not found'})
  } else {
    response.send(gamer)
  }
})

// API 3: Add a gamer
app.post('/gamers/', async (request, response) => {
  const {name, email} = request.body

  if (!name || !email) {
    response.status(400).send({message: 'Name and email are required'})
  } else {
    const result = await db.run(
      'INSERT INTO Gamers (name, email) VALUES (?, ?)',
      [name, email],
    )
    response.status(201).send({gamerId: result.lastID})
  }
})

// API 4: Get all consoles, or search by name and platform
app.get('/consoles/', async (request, response) => {
  const {q} = request.query

  if (q !== undefined) {
    const searchText = `%${q}%`
    const consoles = await db.all(
      `SELECT * FROM Consoles
       WHERE name LIKE ? COLLATE NOCASE OR platform LIKE ? COLLATE NOCASE
       ORDER BY id`,
      [searchText, searchText],
    )

    if (consoles.length === 0) {
      response.status(200).send({consoles: [], message: 'Nothing found'})
    } else {
      response.status(200).send(consoles)
    }
  } else {
    const consoles = await db.all('SELECT * FROM Consoles ORDER BY id')
    response.send(consoles)
  }
})

// API 5: Get one console
app.get('/consoles/:consoleId/', async (request, response) => {
  const {consoleId} = request.params
  const consoleDetails = await db.get(
    'SELECT * FROM Consoles WHERE id = ?',
    [consoleId],
  )

  if (consoleDetails === undefined) {
    response.status(404).send({message: 'Console not found'})
  } else {
    response.send(consoleDetails)
  }
})

// API 6: Add a console
app.post('/consoles/', async (request, response) => {
  const {name, platform} = request.body

  if (
    typeof name !== 'string' ||
    name.trim() === '' ||
    typeof platform !== 'string' ||
    platform.trim() === ''
  ) {
    response.status(400).send({message: 'Name and platform are required'})
  } else {
    const result = await db.run(
      'INSERT INTO Consoles (name, platform) VALUES (?, ?)',
      [name.trim(), platform.trim()],
    )
    response.status(201).send({consoleId: result.lastID})
  }
})

// API 7: Update a console
app.put('/consoles/:consoleId/', async (request, response) => {
  const {consoleId} = request.params
  const {name, platform} = request.body

  if (
    typeof name !== 'string' ||
    name.trim() === '' ||
    typeof platform !== 'string' ||
    platform.trim() === ''
  ) {
    response.status(400).send({message: 'Name and platform are required'})
  } else {
    const consoleDetails = await db.get(
      'SELECT * FROM Consoles WHERE id = ?',
      [consoleId],
    )

    if (consoleDetails === undefined) {
      response.status(404).send({message: 'Console not found'})
    } else {
      await db.run(
        'UPDATE Consoles SET name = ?, platform = ? WHERE id = ?',
        [name.trim(), platform.trim(), consoleId],
      )
      response.send({message: 'Console updated successfully'})
    }
  }
})

// API 8: Delete a console
app.delete('/consoles/:consoleId/', async (request, response) => {
  const {consoleId} = request.params
  const consoleDetails = await db.get(
    'SELECT * FROM Consoles WHERE id = ?',
    [consoleId],
  )

  if (consoleDetails === undefined) {
    response.status(404).send({message: 'Console not found'})
  } else {
    await db.run('DELETE FROM Consoles WHERE id = ?', [consoleId])
    response.send({message: 'Console deleted successfully'})
  }
})

// API 9: Get all bookings
app.get('/bookings/', async (request, response) => {
  const bookings = await db.all('SELECT * FROM Bookings ORDER BY id')
  response.send(bookings)
})

// API 10: Get booking details with gamer and console names
app.get('/bookings/details/', async (request, response) => {
  const bookingDetails = await db.all(`
    SELECT
      Gamers.name AS gamer_name,
      Consoles.name AS console_name,
      Bookings.booking_date,
      Bookings.status
    FROM Bookings
    INNER JOIN Gamers ON Bookings.gamer_id = Gamers.id
    INNER JOIN Consoles ON Bookings.console_id = Consoles.id
    ORDER BY Bookings.id
  `)
  response.send(bookingDetails)
})

// API 11: Get one booking
app.get('/bookings/:bookingId/', async (request, response) => {
  const {bookingId} = request.params
  const booking = await db.get('SELECT * FROM Bookings WHERE id = ?', [
    bookingId,
  ])

  if (booking === undefined) {
    response.status(404).send({message: 'Booking not found'})
  } else {
    response.send(booking)
  }
})

// API 12: Add a booking
app.post('/bookings/', async (request, response) => {
  const {gamer_id, console_id, booking_date, status} = request.body

  if (!gamer_id || !console_id || !booking_date || !status) {
    response.status(400).send({
      message: 'gamer_id, console_id, booking_date and status are required',
    })
  } else {
    const gamer = await db.get('SELECT id FROM Gamers WHERE id = ?', [gamer_id])
    const consoleDetails = await db.get(
      'SELECT id FROM Consoles WHERE id = ?',
      [console_id],
    )

    if (gamer === undefined || consoleDetails === undefined) {
      response.status(404).send({message: 'Gamer or console not found'})
    } else {
      const result = await db.run(
        `INSERT INTO Bookings (gamer_id, console_id, booking_date, status)
         VALUES (?, ?, ?, ?)`,
        [gamer_id, console_id, booking_date, status],
      )
      response.status(201).send({bookingId: result.lastID})
    }
  }
})
