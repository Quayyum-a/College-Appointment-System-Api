const request = require('supertest');
const app = require('../server');
const { initModels, sequelize } = require('../config/database');

async function registerAndLogin(name, email, role) {
  await request(app).post('/auth/register').send({ name, email, password: 'pass123', role });
  const loginRes = await request(app).post('/auth/login').send({ email, password: 'pass123' });
  return { token: loginRes.body.token };
}

describe('Input Validation', () => {
  beforeAll(async () => {
    await initModels();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Register: invalid email and short password rejected', async () => {
    const r1 = await request(app).post('/auth/register').send({ name: 'A', email: 'bad', password: '123', role: 'student' });
    expect(r1.status).toBe(400);

    const r2 = await request(app).post('/auth/register').send({ name: 'Al', email: 'ok@example.com', password: '123', role: 'student' });
    expect(r2.status).toBe(400);
  });

  test('Login: invalid email format rejected', async () => {
    const r = await request(app).post('/auth/login').send({ email: 'not-an-email', password: 'pass123' });
    expect(r.status).toBe(400);
  });

  test('Availability: invalid date or timeSlot rejected', async () => {
    const { token } = await registerAndLogin('Prof V', 'profv@example.com', 'professor');

    const badDate = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2025/01/01', timeSlot: '09:00-09:30' });
    expect(badDate.status).toBe(400);

    const badSlot = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2025-01-01', timeSlot: '09:00-09' });
    expect(badSlot.status).toBe(400);
  });

  test('Availability list: non-numeric professorId rejected', async () => {
    const r = await request(app).get('/availability/abc');
    expect(r.status).toBe(400);
  });

  test('Appointments: invalid ids rejected', async () => {
    const { token: studentToken } = await registerAndLogin('Stu V', 'stuv@example.com', 'student');
    const { token: profToken } = await registerAndLogin('Prof W', 'profw@example.com', 'professor');

    const badBook = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ professorId: 'x', availabilityId: 1 });
    expect(badBook.status).toBe(400);

    const badCancel = await request(app)
      .delete('/appointments/xyz')
      .set('Authorization', `Bearer ${profToken}`);
    expect(badCancel.status).toBe(400);
  });
});
