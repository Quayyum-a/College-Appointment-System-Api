const router = require('express').Router();
const availabilityController = require('../controllers/availabilityController');
const { auth, requireRole } = require('../middleware/authMiddleware');

router.post('/', auth(), requireRole('professor'), availabilityController.addAvailability);

router.get('/:professorId', auth(false), availabilityController.listByProfessor);

module.exports = router;
