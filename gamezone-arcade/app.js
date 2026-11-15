const express = require("express");
const { initializeDatabase } = require("./db");

function createApp(db) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  app.use("/gamers", require("./routes/gamers"));
  app.use("/consoles", require("./routes/consoles"));
  app.use("/bookings", require("./routes/bookings"));

  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found" });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: ["Request body must contain valid JSON"]
      });
    }

    if (error.code === "SQLITE_CONSTRAINT" ||
        (typeof error.code === "string" && error.code.startsWith("SQLITE_CONSTRAINT_"))) {
      const message = error.message.includes("FOREIGN KEY")
        ? "The record is referenced by another record"
        : "The requested record conflicts with existing data";
      return res.status(409).json({ success: false, message });
    }

    console.error("Unexpected request error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  });

  return app;
}

async function start() {
  const db = await initializeDatabase();
  const app = createApp(db);
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => {
    console.log(`GameZone Arcade server is running on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("Server failed to start:", error);
    process.exitCode = 1;
  });
  return { app, db, server };
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Application startup failed:", error);
    process.exitCode = 1;
  });
}

module.exports = { createApp, start };
