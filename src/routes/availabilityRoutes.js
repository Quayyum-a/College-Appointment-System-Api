const router = require('express').Router();
const availabilityController = require('../controllers/availabilityController');
const { auth, requireRole } = require('../middleware/authMiddleware');
const { addAvailabilityValidation, listByProfessorValidation } = require('../validators/availabilityValidators');

router.post('/', auth(), requireRole('professor'), addAvailabilityValidation, availabilityController.addAvailability);

router.get('/:professorId', auth(false), listByProfessorValidation, availabilityController.listByProfessor);

module.exports = router;
