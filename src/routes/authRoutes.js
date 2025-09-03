const router = require('express').Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidators');

router.post('/register', registerValidation, authController.register);

router.post('/login', loginValidation, authController.login);

module.exports = router;
