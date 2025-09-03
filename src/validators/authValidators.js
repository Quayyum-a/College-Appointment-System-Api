const { validate, requiredString, stringEmail } = require('../middleware/validation');

const registerValidation = validate({
  body: [
    requiredString({ field: 'name', min: 2, max: 100 }),
    stringEmail({ field: 'email' }),
    requiredString({ field: 'password', min: 6, max: 128 }),
    // Let service enforce allowed roles to preserve existing error messages
    requiredString({ field: 'role', min: 3, max: 20 }),
  ],
});

const loginValidation = validate({
  body: [
    stringEmail({ field: 'email' }),
    // Allow any non-empty password so service can return 401 for wrong creds
    requiredString({ field: 'password', min: 1, max: 128 }),
  ],
});

module.exports = { registerValidation, loginValidation };
