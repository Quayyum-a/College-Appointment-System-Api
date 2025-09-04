function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function isEmail(value) {
  if (!isString(value)) return false;
  // Simple email regex adequate for basic validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isISODate(value) {
  if (!isString(value)) return false;
  // Accepts YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T00:00:00Z');
  return !isNaN(d.getTime()) && value === d.toISOString().slice(0, 10);
}

function isInt(value) {
  if (typeof value === 'number') return Number.isInteger(value);
  if (isString(value) && /^-?\d+$/.test(value)) return true;
  return false;
}

function toInt(value) {
  return typeof value === 'number' ? value : parseInt(value, 10);
}

function todayISODateUTC() {
  return new Date().toISOString().slice(0, 10);
}

function requiredString({ field, min = 1, max = 255 }) {
  return (data, addError) => {
    const value = data[field];
    if (!isString(value)) return addError(field, 'must be a string');
    const len = value.trim().length;
    if (len < min) return addError(field, `must be at least ${min} characters`);
    if (len > max) return addError(field, `must be at most ${max} characters`);
  };
}

function stringEmail({ field }) {
  return (data, addError) => {
    const value = data[field];
    if (!isString(value)) return addError(field, 'must be a string');
    if (!isEmail(value)) return addError(field, 'must be a valid email');
  };
}

function requiredEnum({ field, values }) {
  return (data, addError) => {
    const value = data[field];
    if (!values.includes(value)) return addError(field, `must be one of: ${values.join(', ')}`);
  };
}

function requiredInt({ field, min = 1 }) {
  return (data, addError) => {
    const value = data[field];
    if (!isInt(value)) return addError(field, 'must be an integer');
    const n = toInt(value);
    if (n < min) return addError(field, `must be >= ${min}`);
  };
}

function requiredISODate({ field }) {
  return (data, addError) => {
    const value = data[field];
    if (!isISODate(value)) return addError(field, 'must be a valid date in YYYY-MM-DD format');
  };
}

function requiredNotPastISODate({ field }) {
  return (data, addError) => {
    const value = data[field];
    if (!isISODate(value)) return addError(field, 'must be a valid date in YYYY-MM-DD format');
    const today = todayISODateUTC();
    if (value < today) return addError(field, 'date cannot be in the past');
  };
}

function timeSlotRange({ field }) {
  return (data, addError) => {
    const value = data[field];
    if (!isString(value)) return addError(field, 'must be a string');
    const match = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(value);
    if (!match) return addError(field, 'must be in HH:MM-HH:MM 24h format');
    const [ , sh, sm, eh, em ] = match;
    const startH = parseInt(sh, 10), startM = parseInt(sm, 10), endH = parseInt(eh, 10), endM = parseInt(em, 10);
    const validH = (h) => h >= 0 && h <= 23;
    const validM = (m) => m >= 0 && m <= 59;
    if (!validH(startH) || !validH(endH) || !validM(startM) || !validM(endM)) return addError(field, 'time values out of range');
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    if (start >= end) return addError(field, 'end time must be after start time');
  };
}

function strongPassword({ field, min = 8 }) {
  return (data, addError) => {
    const value = data[field];
    if (!isString(value)) return addError(field, 'must be a string');
    const trimmed = value.trim();
    if (trimmed.length < min) return addError(field, `must be at least ${min} characters`);
    const hasLetter = /[A-Za-z]/.test(trimmed);
    const hasNumber = /\d/.test(trimmed);
    if (!hasLetter || !hasNumber) return addError(field, 'must include letters and numbers');
  };
}

function validate({ body = [], params = [] }) {
  return (req, res, next) => {
    const errors = [];
    const addError = (field, message, location) => errors.push({ field, message, location });

    for (const rule of body) rule(req.body || {}, (field, message) => addError(field, message, 'body'));
    for (const rule of params) rule(req.params || {}, (field, message) => addError(field, message, 'params'));

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    return next();
  };
}

module.exports = {
  validate,
  requiredString,
  stringEmail,
  requiredEnum,
  requiredInt,
  requiredISODate,
  requiredNotPastISODate,
  timeSlotRange,
  strongPassword,
};
