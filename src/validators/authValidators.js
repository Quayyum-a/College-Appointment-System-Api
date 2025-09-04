const { validate, requiredString, stringEmail, requiredEnum, strongPassword } = require('../middleware/validation');

const registerValidation = validate({
  body: [
    requiredString({ field: 'name', min: 2, max: 100 }),
    stringEmail({ field: 'email' }),
    strongPassword({ field: 'password', min: 8 }),
    requiredEnum({ field: 'role', values: ['student', 'professor'] }),
  ],
});

const loginValidation = validate({
  body: [
    stringEmail({ field: 'email' }),
    // Keep lenient login to allow service to handle incorrect creds uniformly
    requiredString({ field: 'password', min: 1, max: 128 }),
  ],
});

module.exports = { registerValidation, loginValidation };
