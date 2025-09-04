const { Appointment, Availability } = require('../config/database');

async function bookAppointment({ studentId, availabilityId }) {
  const availabilityRecord = await Availability.findByPk(availabilityId);
  if (!availabilityRecord) {
    const errorAvailabilityNotFound = new Error('Availability not found');
    errorAvailabilityNotFound.status = 404;
    throw errorAvailabilityNotFound;
  }
  if (availabilityRecord.isBooked) {
    const errorSlotAlreadyBooked = new Error('Slot already booked');
    errorSlotAlreadyBooked.status = 400;
    throw errorSlotAlreadyBooked;
  }

  const existingBookedAppointment = await Appointment.findOne({ where: { availabilityId, status: 'booked' } });
  if (existingBookedAppointment) {
    const errorSlotAlreadyBooked = new Error('Slot already booked');
    errorSlotAlreadyBooked.status = 400;
    throw errorSlotAlreadyBooked;
  }

  const appointmentRecord = await Appointment.create({
    studentId,
    professorId: availabilityRecord.professorId,
    availabilityId,
    status: 'booked',
  });
  availabilityRecord.isBooked = true;
  await availabilityRecord.save();
  return appointmentRecord;
}

async function listAppointmentsForUser(user) {
  if (user.role === 'student') {
    return Appointment.findAll({ where: { studentId: user.id, status: 'booked' } });
  }
  if (user.role === 'professor') {
    return Appointment.findAll({ where: { professorId: user.id, status: 'booked' } });
  }
  return [];
}

async function cancelAppointment({ professorId, appointmentId }) {
  const appointmentRecord = await Appointment.findByPk(appointmentId);
  if (!appointmentRecord) {
    const errorAppointmentNotFound = new Error('Appointment not found');
    errorAppointmentNotFound.status = 404;
    throw errorAppointmentNotFound;
  }
  if (appointmentRecord.professorId !== professorId) {
    const errorForbidden = new Error('Forbidden');
    errorForbidden.status = 403;
    throw errorForbidden;
  }
  appointmentRecord.status = 'cancelled';
  await appointmentRecord.save();

  const availabilityRecord = await Availability.findByPk(appointmentRecord.availabilityId);
  if (availabilityRecord) {
    availabilityRecord.isBooked = false;
    await availabilityRecord.save();
  }
  return appointmentRecord;
}

module.exports = { bookAppointment, listAppointmentsForUser, cancelAppointment };
