const request = require('supertest');
const app = require('../server');
const { initModels, sequelize } = require('../config/database');

async function registerAndLoginUserAndReturnToken(name, email, role) {
  const registrationResponse = await request(app).post('/auth/register').send({ name, email, password: 'pass123', role });
  const loginResponse = await request(app).post('/auth/login').send({ email, password: 'pass123' });
  return { token: loginResponse.body.token, id: registrationResponse.body.id };
}

describe('Availability', () => {
  beforeAll(async () => {
    await initModels();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Professor can add availability; student cannot; duplicate (overlap) rejected; students fetch unbooked slots', async () => {
    const { token: professorAuthToken, id: professorId } = await registerAndLoginUserAndReturnToken('Prof A', 'profA@example.com', 'professor');
const { token: studentAuthToken } = await registerAndLoginUserAndReturnToken('Stu A', 'stuA@example.com', 'student');

    const a1 = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({ date: '2025-01-01', timeSlot: '09:00-09:30' });
    expect(a1.status).toBe(201);

    const dup = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${professorAuthToken}`)
      .send({ date: '2025-01-01', timeSlot: '09:00-09:30' });
    expect(dup.status).toBe(400);

    const forbidden = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ date: '2025-01-01', timeSlot: '10:00-10:30' });
    expect(forbidden.status).toBe(403);

    const availableSlotsResponse = await request(app).get(`/availability/${professorId}`);
    expect(availableSlotsResponse.status).toBe(200);
expect(Array.isArray(availableSlotsResponse.body)).toBe(true);
expect(availableSlotsResponse.body.some((slot) => slot.timeSlot === '09:00-09:30')).toBe(true);
  });

  test('Unauthenticated users cannot add availability', async () => {
    const unauthenticatedAvailabilityCreateResponse = await request(app).post('/availability').send({ date: '2025-01-02', timeSlot: '10:00-10:30' });
expect(unauthenticatedAvailabilityCreateResponse.status).toBe(401);
  });

  test('Different professors can create identical time slots on same date', async () => {
    const { token: professorOneAuthToken } = await registerAndLoginUserAndReturnToken('Prof B', 'profB_av@example.com', 'professor');
const { token: professorTwoAuthToken } = await registerAndLoginUserAndReturnToken('Prof C', 'profC_av@example.com', 'professor');

    const r1 = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${professorOneAuthToken}`)
      .send({ date: '2025-01-03', timeSlot: '08:00-08:30' });
    expect(r1.status).toBe(201);

    const r2 = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${professorTwoAuthToken}`)
      .send({ date: '2025-01-03', timeSlot: '08:00-08:30' });
    expect(r2.status).toBe(201);
  });

  test('Booked slots are not returned in available list', async () => {
    const { token: professorAuthTokenTwo, id: professorIdTwo } = await registerAndLoginUserAndReturnToken('Prof D', 'profD_av@example.com', 'professor');
const { token: studentAuthTokenTwo } = await registerAndLoginUserAndReturnToken('Stu B', 'stuB_av@example.com', 'student');

    const a1 = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${professorAuthTokenTwo}`)
  .send({ date: '2025-01-04', timeSlot: '13:00-13:30' });
    expect(a1.status).toBe(201);

    const availableSlotsBeforeBookingResponse = await request(app).get(`/availability/${professorIdTwo}`);
expect(availableSlotsBeforeBookingResponse.body.some((slot) => slot.timeSlot === '13:00-13:30')).toBe(true);

const selectedSlot = availableSlotsBeforeBookingResponse.body.find((slot) => slot.timeSlot === '13:00-13:30');
const createAppointmentResponse = await request(app)
  .post('/appointments')
  .set('Authorization', `Bearer ${studentAuthTokenTwo}`)
  .send({ professorId: selectedSlot.professorId, availabilityId: selectedSlot.id });
expect(createAppointmentResponse.status).toBe(201);

const availableSlotsAfterBookingResponse = await request(app).get(`/availability/${professorIdTwo}`);
expect(availableSlotsAfterBookingResponse.body.some((slot) => slot.timeSlot === '13:00-13:30')).toBe(false);
  });
});
