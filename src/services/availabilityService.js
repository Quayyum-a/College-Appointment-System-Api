const { Availability } = require('../config/database');

function parseTimeSlotToMinutes(slot) {
  const match = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(slot);
  const start = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  const end = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
  return { start, end };
}

function rangesOverlap(a, b) {
  return a.start < b.end && a.end > b.start;
}

async function addAvailability({ professorId, date, timeSlot }) {
  // Prevent overlapping ranges for the same professor and date
  const existingSlotsSameDay = await Availability.findAll({ where: { professorId, date } });
  const newRange = parseTimeSlotToMinutes(timeSlot);
  for (const slot of existingSlotsSameDay) {
    const existingRange = parseTimeSlotToMinutes(slot.timeSlot);
    if (rangesOverlap(newRange, existingRange)) {
      const errorOverlappingAvailability = new Error('Availability overlaps existing slot');
      errorOverlappingAvailability.status = 400;
      throw errorOverlappingAvailability;
    }
  }

  const createdAvailabilityRecord = await Availability.create({ professorId, date, timeSlot, isBooked: false });
  return createdAvailabilityRecord;
}

async function getAvailableSlots(professorId) {
  return Availability.findAll({ where: { professorId, isBooked: false } });
}

async function setBooked(availabilityId, isBooked) {
  const availabilityRecord = await Availability.findByPk(availabilityId);
  if (!availabilityRecord) {
    const errorAvailabilityNotFound = new Error('Availability not found');
    errorAvailabilityNotFound.status = 404;
    throw errorAvailabilityNotFound;
  }
  availabilityRecord.isBooked = isBooked;
  await availabilityRecord.save();
  return availabilityRecord;
}

module.exports = { addAvailability, getAvailableSlots, setBooked };
