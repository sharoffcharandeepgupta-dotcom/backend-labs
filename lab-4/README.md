# GameZone Arcade – Console Station Booking Management System

**Group:** LG 1 – Group 1

A beginner-friendly backend project built with Node.js, Express, SQLite and JavaScript. The database file (`gameZone.db`) and its three tables are created automatically when the app starts. Sample gamers, consoles and bookings are added once.

## Install and run

1. Install Node.js.
2. Open this project folder in VS Code.
3. Open **Terminal → New Terminal** and run:

   ```sh
   npm install
   npm start
   ```

4. The server runs at `http://localhost:3000`. Keep the terminal open while testing in Postman.

## Postman API URLs

Use `http://localhost:3000` as the base URL. For POST and PUT requests, select **Body → raw → JSON** and set `Content-Type: application/json`.

| Method | URL | Purpose |
|---|---|---|
| GET | `/gamers/` | Get all gamers |
| GET | `/gamers/1/` | Get gamer with ID 1 |
| POST | `/gamers/` | Add a gamer |
| GET | `/consoles/` | Get all consoles |
| GET | `/consoles/1/` | Get console with ID 1 |
| POST | `/consoles/` | Add a console |
| PUT | `/consoles/1/` | Update console with ID 1 |
| DELETE | `/consoles/1/` | Delete console with ID 1 |
| GET | `/consoles/?q=console` | Search console name and platform |
| GET | `/bookings/` | Get all bookings |
| GET | `/bookings/1/` | Get booking with ID 1 |
| POST | `/bookings/` | Add a booking |
| GET | `/bookings/details/` | Get booking details with gamer and console names |

## Sample request bodies

Add a gamer (`POST /gamers/`):

```json
{
  "name": "Taylor Smith",
  "email": "taylor@example.com"
}
```

Add a console (`POST /consoles/`):

```json
{
  "name": "Arcade Console Z",
  "platform": "Nintendo Switch"
}
```

Update a console (`PUT /consoles/1/`):

```json
{
  "name": "Arcade Console Z Updated",
  "platform": "Nintendo Switch"
}
```

Add a booking (`POST /bookings/`):

```json
{
  "gamer_id": 1,
  "console_id": 1,
  "booking_date": "2026-11-22",
  "status": "Confirmed"
}
```

## Expected responses

### Gamers

`GET /gamers/` returns an array, for example:

```json
[
  {"id": 1, "name": "Alex Morgan", "email": "alex@example.com"},
  {"id": 2, "name": "Jamie Lee", "email": "jamie@example.com"}
]
```

`GET /gamers/1/` returns one gamer object. `POST /gamers/` returns **201 Created** and a generated ID, for example `{"gamerId": 3}`. Missing gamers return **404**.

### Consoles and smart search

`GET /consoles/` returns an array of console objects. `GET /consoles/1/` returns one console object, such as `{"id":1,"name":"GameZone Console X","platform":"PlayStation"}`.

`POST /consoles/` returns **201 Created**, for example `{"consoleId":3}`. A missing name or platform returns **400 Bad Request**. `PUT /consoles/1/` returns `{"message":"Console updated successfully"}`; invalid details return **400**, and an unknown ID returns **404**. `DELETE /consoles/1/` returns `{"message":"Console deleted successfully"}`; an unknown ID returns **404**.

Search is case-insensitive and matches text anywhere in the console name or platform:

- `GET /consoles/?q=console` returns matching console objects with **200 OK**.
- `GET /consoles/?q=CONSOLE` returns the same matching objects with **200 OK**.
- `GET /consoles/?q=zzz` returns **200 OK** with `{"consoles":[],"message":"Nothing found"}`.

### Bookings

`GET /bookings/` returns booking records with `gamer_id`, `console_id`, `booking_date`, and `status`. `GET /bookings/1/` returns one booking record.

`GET /bookings/details/` returns rows shaped like:

```json
[
  {
    "gamer_name": "Alex Morgan",
    "console_name": "GameZone Console X",
    "booking_date": "2026-11-20",
    "status": "Confirmed"
  }
]
```

`POST /bookings/` returns **201 Created**, for example `{"bookingId":3}`. It returns **400** if a required field is missing and **404** if the gamer or console ID does not exist.
