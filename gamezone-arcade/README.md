# GameZone Arcade – Console Station Booking Management System

GameZone Arcade is a Node.js and Express backend for managing arcade gamers, gaming consoles, and console bookings. It stores records in SQLite and exposes JSON REST APIs for CRUD operations, booking lookups, and smart console search.

## Objectives

- Manage gamer, console, and booking records in a relational database.
- Validate API input and return clear HTTP status codes and JSON errors.
- Keep booking references consistent with SQLite foreign keys.
- Search console names and platforms using case-insensitive partial matching.

## Technologies

Node.js, Express.js, SQLite (`sqlite3`), JavaScript, Postman, and VS Code.

## Project structure

```text
gamezone-arcade/
├── app.js
├── db.js
├── validation.js
├── package.json
├── package-lock.json
├── gameZone.db                 # Created automatically on first startup
├── routes/
│   ├── bookings.js
│   ├── consoles.js
│   └── gamers.js
└── postman/
    └── GameZone_API_Collection.json
```

## Database design

| Table | Columns |
| --- | --- |
| `gamers` | `id` primary key, `name` required, `email` required and unique |
| `consoles` | `id` primary key, `name` required, `platform` required |
| `bookings` | `id` primary key, `gamer_id` and `console_id` foreign keys, `booking_date` and `status` required |

SQLite foreign-key enforcement is enabled. Tables are created with `CREATE TABLE IF NOT EXISTS`; the application does not drop tables or delete existing data. Two sample records per table are inserted only when all three tables are empty. The database file is created in the project directory.

## Group members and role allocation

| Group member | Roll number | Assigned responsibilities |
| --- | --- | --- |
| Jaswanth Narayana | 252U1R9170 | Express server setup, middleware, routes, server configuration, and error handling |
| Tarendra Reddy | 252U1R9157 | SQLite setup, database connection, tables, primary/foreign keys, and sample data |
| Rohith Reddy | 252U1R9150 | Console CRUD APIs and booking JOIN endpoint |
| Charan Deep Guptha | 252U1R9146 | Input validation, invalid-input handling, error messages, HTTP codes, and JSON errors |
| Shivs Reddy | 252U1R9128 | Smart console search, Postman collection, README, and API testing documentation |

## Installation and startup

Install Node.js 18 or later, then run these commands from the project directory:

```powershell
npm install
npm start
```

The server listens on port `3000` by default and prints a startup message. To use a different port, set `PORT` before `npm start`. The SQLite database is initialized automatically.

## API endpoints

All responses are JSON. IDs in URL paths must be positive integers.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/gamers/` | List gamers |
| GET | `/gamers/:id` | Get a gamer |
| POST | `/gamers/` | Create a gamer |
| GET | `/consoles/` | List consoles |
| GET | `/consoles/:id` | Get a console |
| POST | `/consoles/` | Create a console |
| PUT | `/consoles/:id` | Update a console |
| DELETE | `/consoles/:id` | Delete a console |
| GET | `/consoles/?q=PlayStation` | Search console names and platforms |
| GET | `/bookings/` | List bookings |
| GET | `/bookings/:id` | Get a booking |
| POST | `/bookings/` | Create a booking |
| GET | `/bookings/details/` | List bookings with gamer and console names |

### Example requests

Create a gamer:

```json
{
  "name": "Taylor Nguyen",
  "email": "taylor.nguyen@example.com"
}
```

Create or update a console:

```json
{
  "name": "PlayStation 5",
  "platform": "Sony"
}
```

Create a booking (IDs must exist):

```json
{
  "gamer_id": 1,
  "console_id": 1,
  "booking_date": "2026-12-01",
  "status": "Confirmed"
}
```

### Example responses

Successful booking creation:

```json
{
  "success": true,
  "message": "Booking created",
  "booking": {
    "id": 3,
    "gamer_id": 1,
    "console_id": 1,
    "booking_date": "2026-12-01",
    "status": "Confirmed"
  }
}
```

Booking details include the names resolved by SQL joins:

```json
{
  "success": true,
  "bookings": [
    {
      "id": 1,
      "gamer_id": 1,
      "gamer_name": "Alex Morgan",
      "console_id": 1,
      "console_name": "PlayStation 5",
      "booking_date": "2026-11-20",
      "status": "Confirmed"
    }
  ]
}
```

No console search results:

```json
{
  "success": true,
  "consoles": [],
  "message": "Nothing found"
}
```

## Validation and error handling

- Required string fields reject missing, null, empty, and whitespace-only values. Gamer email is also checked for basic email syntax.
- Booking gamer and console IDs must be positive integer JSON numbers and must refer to existing records.
- Booking dates must be real calendar dates in `YYYY-MM-DD` form.
- Invalid input returns HTTP `400` with a `Validation failed` message and an `errors` array.
- Missing records return `404`. Duplicate gamer emails and foreign-key conflicts return `409`.
- Unexpected errors are logged on the server and return HTTP `500` without exposing database internals.
- Malformed JSON is rejected with HTTP `400`.

## Postman testing

1. Start the server with `npm start`.
2. In Postman, choose **Import** and select `postman/GameZone_API_Collection.json`.
3. Keep the collection's `baseUrl` at `http://localhost:3000` (or change it for your server).
4. Run requests in sequence. The create requests save returned gamer, console, and booking IDs as collection variables.
5. The collection covers list/get/create operations, console update/delete/search, the booking JOIN endpoint, invalid required values, invalid gamer/console references, invalid date, and a missing booking.

The collection documents test requests; results should be recorded only after running the requests against the started application.
