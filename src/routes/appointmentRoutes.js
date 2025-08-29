const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');
const { auth, requireRole } = require('../middleware/authMiddleware');

router.post('/', auth(), requireRole('student'), appointmentController.book);

router.get('/', auth(), appointmentController.list);

router.delete('/:id', auth(), requireRole('professor'), appointmentController.cancel);

module.exports = router;
