function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateGamer(body) {
  body = body && typeof body === "object" ? body : {};
  const errors = [];
  if (!isNonEmptyString(body.name)) errors.push("Name is required");
  if (!isNonEmptyString(body.email)) errors.push("Email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.push("Email must be valid");
  }
  return errors;
}

function validateConsole(body) {
  body = body && typeof body === "object" ? body : {};
  const errors = [];
  if (!isNonEmptyString(body.name)) errors.push("Console name is required");
  if (!isNonEmptyString(body.platform)) errors.push("Platform is required");
  return errors;
}

function validateBooking(body) {
  body = body && typeof body === "object" ? body : {};
  const errors = [];
  if (!isPositiveInteger(body.gamer_id)) errors.push("Gamer ID must be a positive integer");
  if (!isPositiveInteger(body.console_id)) errors.push("Console ID must be a positive integer");
  if (!isValidDate(body.booking_date)) {
    errors.push("Booking date must be valid and use YYYY-MM-DD format");
  }
  if (!isNonEmptyString(body.status)) errors.push("Booking status is required");
  return errors;
}

function validatePathId(value) {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
}

module.exports = {
  validateBooking,
  validateConsole,
  validateGamer,
  validatePathId
};
