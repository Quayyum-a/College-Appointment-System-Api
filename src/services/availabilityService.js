const { Availability } = require('../config/database');

async function addAvailability({ professorId, date, timeSlot }) {
  const existingAvailabilitySlot = await Availability.findOne({ where: { professorId, date, timeSlot } });
  if (existingAvailabilitySlot) {
    const errorOverlappingAvailability = new Error('Availability overlaps existing slot');
    errorOverlappingAvailability.status = 400;
    throw errorOverlappingAvailability;
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
