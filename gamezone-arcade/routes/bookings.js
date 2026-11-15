const express = require("express");
const { validateBooking, validatePathId } = require("../validation");

const router = express.Router();

function validationError(res, errors) {
  return res.status(400).json({ success: false, message: "Validation failed", errors });
}

const bookingFields = "id, gamer_id, console_id, booking_date, status";

router.get("/details", async (req, res) => {
  const bookings = await req.db.all(`
    SELECT bookings.id, bookings.gamer_id, gamers.name AS gamer_name,
           bookings.console_id, consoles.name AS console_name,
           bookings.booking_date, bookings.status
    FROM bookings
    JOIN gamers ON gamers.id = bookings.gamer_id
    JOIN consoles ON consoles.id = bookings.console_id
    ORDER BY bookings.id
  `);
  return res.json({ success: true, bookings });
});

router.get("/", async (req, res) => {
  const bookings = await req.db.all(`SELECT ${bookingFields} FROM bookings ORDER BY id`);
  return res.json({ success: true, bookings });
});

router.get("/:id", async (req, res) => {
  if (!validatePathId(req.params.id)) {
    return validationError(res, ["Booking ID must be a positive integer"]);
  }

  const booking = await req.db.get(
    `SELECT ${bookingFields} FROM bookings WHERE id = ?`,
    req.params.id
  );
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  return res.json({ success: true, booking });
});

router.post("/", async (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length) return validationError(res, errors);

  const gamer = await req.db.get("SELECT id FROM gamers WHERE id = ?", req.body.gamer_id);
  if (!gamer) return res.status(404).json({ success: false, message: "Gamer not found" });
  const consoleRecord = await req.db.get("SELECT id FROM consoles WHERE id = ?", req.body.console_id);
  if (!consoleRecord) return res.status(404).json({ success: false, message: "Console not found" });

  const result = await req.db.run(
    `INSERT INTO bookings (gamer_id, console_id, booking_date, status)
     VALUES (?, ?, ?, ?)`,
    req.body.gamer_id,
    req.body.console_id,
    req.body.booking_date,
    req.body.status.trim()
  );
  const booking = await req.db.get(
    `SELECT ${bookingFields} FROM bookings WHERE id = ?`,
    result.lastID
  );
  return res.status(201).json({ success: true, message: "Booking created", booking });
});

module.exports = router;
