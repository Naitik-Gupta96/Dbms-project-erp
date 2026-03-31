const mongoose = require("mongoose");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : value;
}

function assertRequiredFields(payload, fields) {
  const missing = fields.filter((field) => !isNonEmptyString(payload[field]));
  if (missing.length > 0) {
    return `Missing required field(s): ${missing.join(", ")}`;
  }
  return null;
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

module.exports = {
  assertRequiredFields,
  isNonEmptyString,
  isValidObjectId,
  normalizeString,
  parseOptionalNumber
};
