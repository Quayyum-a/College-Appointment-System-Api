const { validate, requiredInt } = require('../middleware/validation');

const bookAppointmentValidation = validate({
  body: [
    requiredInt({ field: 'professorId', min: 1 }),
    requiredInt({ field: 'availabilityId', min: 1 }),
  ],
});

const cancelAppointmentValidation = validate({
  params: [requiredInt({ field: 'id', min: 1 })],
});

module.exports = { bookAppointmentValidation, cancelAppointmentValidation };
