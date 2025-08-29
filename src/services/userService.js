const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../config/database');

async function register({ name, email, password, role }) {
  const existingUserWithEmail = await User.findOne({ where: { email } });
  if (existingUserWithEmail) {
    const errorDuplicateEmail = new Error('Email already registered');
    errorDuplicateEmail.status = 400;
    throw errorDuplicateEmail;
  }
  const isRoleValid = ['student', 'professor'].includes(role);
  if (!isRoleValid) {
    const errorInvalidRole = new Error('Invalid role');
    errorInvalidRole.status = 400;
    throw errorInvalidRole;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const createdUserAccount = await User.create({ name, email, password: passwordHash, role });
  return { id: createdUserAccount.id, name: createdUserAccount.name, email: createdUserAccount.email, role: createdUserAccount.role };
}

async function login({ email, password }) {
  const userAccountRecord = await User.findOne({ where: { email } });
  if (!userAccountRecord) {
    const errorInvalidCredentials = new Error('Invalid credentials');
    errorInvalidCredentials.status = 401;
    throw errorInvalidCredentials;
  }
  const isPasswordValid = await bcrypt.compare(password, userAccountRecord.password);
  if (!isPasswordValid) {
    const errorInvalidCredentials = new Error('Invalid credentials');
    errorInvalidCredentials.status = 401;
    throw errorInvalidCredentials;
  }
  const jwtToken = jwt.sign({ id: userAccountRecord.id, role: userAccountRecord.role }, process.env.JWT_SECRET || 'supersecret_jwt_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  return { token: jwtToken };
}

module.exports = { register, login };
