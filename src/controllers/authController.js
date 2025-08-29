const userService = require('../services/userService');

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const createdUserResponse = await userService.register({ name, email, password, role });
    res.status(201).json(createdUserResponse);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const authenticationResponse = await userService.login({ email, password });
    res.json(authenticationResponse);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
