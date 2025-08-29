const request = require('supertest');
const app = require('../server');
const { initModels, sequelize } = require('../config/database');

describe('Auth', () => {
  beforeAll(async () => {
    await initModels();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('User can register with student and professor roles; duplicate email fails', async () => {
  const registerStudentResponse = await request(app).post('/auth/register').send({
    name: 'Alice',
    email: 'alice@example.com',
    password: 'password',
    role: 'student',
  });
  expect(registerStudentResponse.status).toBe(201);

  const registerProfessorResponse = await request(app).post('/auth/register').send({
    name: 'Prof',
    email: 'prof@example.com',
    password: 'password',
    role: 'professor',
  });
  expect(registerProfessorResponse.status).toBe(201);

  const registerDuplicateEmailResponse = await request(app).post('/auth/register').send({
    name: 'Alice2',
    email: 'alice@example.com',
    password: 'password',
    role: 'student',
  });
  expect(registerDuplicateEmailResponse.status).toBe(400);
});

  test('User can login and get JWT; invalid login fails', async () => {
    const successfulLoginResponse = await request(app).post('/auth/login').send({ email: 'alice@example.com', password: 'password' });
expect(successfulLoginResponse.status).toBe(200);
expect(successfulLoginResponse.body.token).toBeTruthy();

const invalidPasswordLoginResponse = await request(app).post('/auth/login').send({ email: 'alice@example.com', password: 'wrong' });
expect(invalidPasswordLoginResponse.status).toBe(401);
  });

  test('Invalid role is rejected on registration', async () => {
    const invalidRoleRegistrationResponse = await request(app)
  .post('/auth/register')
  .send({ name: 'Hacker', email: 'hacker@example.com', password: 'password', role: 'admin' });
expect(invalidRoleRegistrationResponse.status).toBe(400);
expect(invalidRoleRegistrationResponse.body.message).toMatch(/Invalid role/i);
  });

  test('Login fails for unknown email', async () => {
    const unknownEmailLoginResponse = await request(app).post('/auth/login').send({ email: 'nouser@example.com', password: 'password' });
expect(unknownEmailLoginResponse.status).toBe(401);
expect(unknownEmailLoginResponse.body.message).toMatch(/Invalid credentials/i);
  });

  test('JWT looks valid (three segments)', async () => {
    const professorLoginResponse = await request(app).post('/auth/login').send({ email: 'prof@example.com', password: 'password' });
expect(professorLoginResponse.status).toBe(200);
const jwtTokenString = professorLoginResponse.body.token;
expect(typeof jwtTokenString).toBe('string');
expect(jwtTokenString.split('.').length).toBe(3);
  });
});
