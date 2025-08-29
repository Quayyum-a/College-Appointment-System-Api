const request = require('supertest');
const app = require('../server');
const { initModels, sequelize } = require('../config/database');

async function registerAndLoginUserAndReturnToken(name, email, role) {
  const registrationResponse = await request(app).post('/auth/register').send({ name, email, password: 'pass123', role });
  const loginResponse = await request(app).post('/auth/login').send({ email, password: 'pass123' });
  return { token: loginResponse.body.token, id: registrationResponse.body.id };
}

describe('E2E Flow', () => {
  beforeAll(async () => {
    await initModels();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('A1 registers/logs in; P1 registers/logs in; P1 adds T1; A1 views+books T1; A2 registers+books T2; P1 cancels A1; A1 sees none', async () => {
    const { token: studentOneAuthToken, id: studentOneId } = await registerAndLoginUserAndReturnToken('Student A1', 'a1@example.com', 'student');
const { token: professorOneAuthToken, id: professorOneId } = await registerAndLoginUserAndReturnToken('Professor P1', 'p1@example.com', 'professor');

    const t1 = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${professorOneAuthToken}`)
      .send({ date: '2025-04-01', timeSlot: '10:00-10:30' });
    expect(t1.status).toBe(201);

    const availabilityForProfessorOneResponse = await request(app).get(`/availability/${professorOneId}`);
const availabilitySlotTenAM = availabilityForProfessorOneResponse.body.find((slot) => slot.timeSlot === '10:00-10:30');

    const bookT1 = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${studentOneAuthToken}`)
      .send({ professorId: availabilitySlotTenAM.professorId, availabilityId: availabilitySlotTenAM.id });
    expect(bookT1.status).toBe(201);

    const { token: studentTwoAuthToken } = await registerAndLoginUserAndReturnToken('Student A2', 'a2@example.com', 'student');
    const t2 = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${professorOneAuthToken}`)
      .send({ date: '2025-04-01', timeSlot: '11:00-11:30' });
    expect(t2.status).toBe(201);

    const availabilityForProfessorOneResponseTwo = await request(app).get(`/availability/${professorOneId}`);
const availabilitySlotElevenAM = availabilityForProfessorOneResponseTwo.body.find((slot) => slot.timeSlot === '11:00-11:30');

    const bookT2 = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${studentTwoAuthToken}`)
      .send({ professorId: availabilitySlotElevenAM.professorId, availabilityId: availabilitySlotElevenAM.id });
    expect(bookT2.status).toBe(201);

    const cancelA1 = await request(app)
      .delete(`/appointments/${bookT1.body.id}`)
      .set('Authorization', `Bearer ${professorOneAuthToken}`);
    expect(cancelA1.status).toBe(200);

    const studentOneAppointmentsResponse = await request(app).get('/appointments').set('Authorization', `Bearer ${studentOneAuthToken}`);
expect(studentOneAppointmentsResponse.status).toBe(200);
expect(studentOneAppointmentsResponse.body.length).toBe(0);
  });

  test('Health check responds ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
