const appointmentService = require('../services/appointmentService');

async function book(req, res, next) {
  try {
    const { professorId, availabilityId } = req.body;
    const createdAppointmentRecord = await appointmentService.bookAppointment({
      studentId: req.user.id,
      professorId,
      availabilityId,
    });
    res.status(201).json(createdAppointmentRecord);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const bookedAppointmentsForUser = await appointmentService.listAppointmentsForUser(req.user);
    res.json(bookedAppointmentsForUser);
  } catch (error) {
    next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const { id } = req.params;
    const cancelledAppointmentRecord = await appointmentService.cancelAppointment({ professorId: req.user.id, appointmentId: Number(id) });
    res.json(cancelledAppointmentRecord);
  } catch (error) {
    next(error);
  }
}

module.exports = { book, list, cancel };
