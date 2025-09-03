const { validate, requiredISODate, requiredString, timeSlotRange, requiredInt } = require('../middleware/validation');

const addAvailabilityValidation = validate({
  body: [
    requiredISODate({ field: 'date' }),
    requiredString({ field: 'timeSlot', min: 9, max: 11 }),
    timeSlotRange({ field: 'timeSlot' }),
  ],
});

const listByProfessorValidation = validate({
  params: [requiredInt({ field: 'professorId', min: 1 })],
});

module.exports = { addAvailabilityValidation, listByProfessorValidation };
