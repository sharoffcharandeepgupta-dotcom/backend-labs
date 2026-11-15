const express = require("express");
const { validateConsole, validatePathId } = require("../validation");

const router = express.Router();

function validationError(res, errors) {
  return res.status(400).json({ success: false, message: "Validation failed", errors });
}

router.get("/", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  let consoles;

  if (query) {
    const pattern = `%${query.toLocaleLowerCase()}%`;
    consoles = await req.db.all(
      `SELECT id, name, platform
       FROM consoles
       WHERE LOWER(name) LIKE ? OR LOWER(platform) LIKE ?
       ORDER BY id`,
      pattern,
      pattern
    );
    if (consoles.length === 0) {
      return res.json({ success: true, consoles: [], message: "Nothing found" });
    }
  } else {
    consoles = await req.db.all("SELECT id, name, platform FROM consoles ORDER BY id");
  }

  return res.json({ success: true, consoles });
});

router.get("/:id", async (req, res) => {
  if (!validatePathId(req.params.id)) {
    return validationError(res, ["Console ID must be a positive integer"]);
  }

  const consoleRecord = await req.db.get(
    "SELECT id, name, platform FROM consoles WHERE id = ?",
    req.params.id
  );
  if (!consoleRecord) return res.status(404).json({ success: false, message: "Console not found" });
  return res.json({ success: true, console: consoleRecord });
});

router.post("/", async (req, res) => {
  const errors = validateConsole(req.body);
  if (errors.length) return validationError(res, errors);

  const result = await req.db.run(
    "INSERT INTO consoles (name, platform) VALUES (?, ?)",
    req.body.name.trim(),
    req.body.platform.trim()
  );
  const consoleRecord = await req.db.get(
    "SELECT id, name, platform FROM consoles WHERE id = ?",
    result.lastID
  );
  return res.status(201).json({ success: true, message: "Console created", console: consoleRecord });
});

router.put("/:id", async (req, res) => {
  if (!validatePathId(req.params.id)) {
    return validationError(res, ["Console ID must be a positive integer"]);
  }
  const errors = validateConsole(req.body);
  if (errors.length) return validationError(res, errors);

  const existing = await req.db.get("SELECT id FROM consoles WHERE id = ?", req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Console not found" });

  await req.db.run(
    "UPDATE consoles SET name = ?, platform = ? WHERE id = ?",
    req.body.name.trim(),
    req.body.platform.trim(),
    req.params.id
  );
  const consoleRecord = await req.db.get(
    "SELECT id, name, platform FROM consoles WHERE id = ?",
    req.params.id
  );
  return res.json({ success: true, message: "Console updated", console: consoleRecord });
});

router.delete("/:id", async (req, res) => {
  if (!validatePathId(req.params.id)) {
    return validationError(res, ["Console ID must be a positive integer"]);
  }

  const result = await req.db.run("DELETE FROM consoles WHERE id = ?", req.params.id);
  if (result.changes === 0) return res.status(404).json({ success: false, message: "Console not found" });
  return res.json({ success: true, message: "Console deleted" });
});

module.exports = router;
