const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');
const { auth, requireRole } = require('../middleware/authMiddleware');
const { bookAppointmentValidation, cancelAppointmentValidation } = require('../validators/appointmentValidators');

router.post('/', auth(), requireRole('student'), bookAppointmentValidation, appointmentController.book);

router.get('/', auth(), appointmentController.list);

router.delete('/:id', auth(), requireRole('professor'), cancelAppointmentValidation, appointmentController.cancel);

module.exports = router;
