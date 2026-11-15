const express = require("express");
const { validateGamer, validatePathId } = require("../validation");

const router = express.Router();

function validationError(res, errors) {
  return res.status(400).json({ success: false, message: "Validation failed", errors });
}

router.get("/", async (req, res) => {
  const gamers = await req.db.all("SELECT id, name, email FROM gamers ORDER BY id");
  return res.json({ success: true, gamers });
});

router.get("/:id", async (req, res) => {
  if (!validatePathId(req.params.id)) {
    return validationError(res, ["Gamer ID must be a positive integer"]);
  }

  const gamer = await req.db.get("SELECT id, name, email FROM gamers WHERE id = ?", req.params.id);
  if (!gamer) return res.status(404).json({ success: false, message: "Gamer not found" });
  return res.json({ success: true, gamer });
});

router.post("/", async (req, res) => {
  const errors = validateGamer(req.body);
  if (errors.length) return validationError(res, errors);

  const name = req.body.name.trim();
  const email = req.body.email.trim();
  const existing = await req.db.get("SELECT id FROM gamers WHERE LOWER(email) = LOWER(?)", email);
  if (existing) return res.status(409).json({ success: false, message: "A gamer with this email already exists" });

  const result = await req.db.run(
    "INSERT INTO gamers (name, email) VALUES (?, ?)",
    name,
    email
  );
  const gamer = await req.db.get("SELECT id, name, email FROM gamers WHERE id = ?", result.lastID);
  return res.status(201).json({ success: true, message: "Gamer created", gamer });
});

module.exports = router;
