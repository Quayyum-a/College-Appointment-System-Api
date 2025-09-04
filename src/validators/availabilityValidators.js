const { validate, requiredNotPastISODate, requiredString, timeSlotRange, requiredInt } = require('../middleware/validation');

function ensureEndTimeInFutureIfToday({ dateField, slotField }) {
  return (data, addError) => {
    const dateValue = data[dateField];
    const slotValue = data[slotField];
    if (!dateValue || !slotValue) return;
    const todayISO = new Date().toISOString().slice(0, 10);
    if (dateValue !== todayISO) return;
    const match = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(slotValue);
    if (!match) return; // handled by timeSlotRange
    const endH = parseInt(match[3], 10);
    const endM = parseInt(match[4], 10);
    const now = new Date();
    const nowMinutesUTC = now.getUTCHours() * 60 + now.getUTCMinutes();
    const endMinutes = endH * 60 + endM;
    if (endMinutes <= nowMinutesUTC) {
      addError(slotField, 'end time must be in the future for today');
    }
  };
}

const addAvailabilityValidation = validate({
  body: [
    requiredNotPastISODate({ field: 'date' }),
    requiredString({ field: 'timeSlot', min: 9, max: 11 }),
    timeSlotRange({ field: 'timeSlot' }),
    ensureEndTimeInFutureIfToday({ dateField: 'date', slotField: 'timeSlot' }),
  ],
});

const listByProfessorValidation = validate({
  params: [requiredInt({ field: 'professorId', min: 1 })],
});

module.exports = { addAvailabilityValidation, listByProfessorValidation };
