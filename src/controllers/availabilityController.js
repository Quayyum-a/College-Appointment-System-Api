const availabilityService = require('../services/availabilityService');

async function addAvailability(req, res, next) {
  try {
    const { date, timeSlot } = req.body;
    const authenticatedProfessorId = req.user.id;
    const createdAvailabilityRecord = await availabilityService.addAvailability({ professorId: authenticatedProfessorId, date, timeSlot });
    res.status(201).json(createdAvailabilityRecord);
  } catch (error) {
    next(error);
  }
}

async function listByProfessor(req, res, next) {
  try {
    const { professorId } = req.params;
    const availableSlotsForProfessor = await availabilityService.getAvailableSlots(Number(professorId));
    res.json(availableSlotsForProfessor);
  } catch (error) {
    next(error);
  }
}

module.exports = { addAvailability, listByProfessor };
