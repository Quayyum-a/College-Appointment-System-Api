const request = require('supertest');
const app = require('../server');
const { initModels, sequelize } = require('../config/database');

async function registerAndLoginUserAndReturnToken(name, email, role) {
  const registrationResponse = await request(app).post('/auth/register').send({ name, email, password: 'pass123', role });
  const loginResponse = await request(app).post('/auth/login').send({ email, password: 'pass123' });
  return { token: loginResponse.body.token, id: registrationResponse.body.id };
}

describe('Appointments', () => {
  beforeAll(async () => {
    await initModels();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Student can book a free slot; double booking prevented; professor cannot book', async () => {
    const { token: professorAuthToken, id: professorId } = await registerAndLoginUserAndReturnToken('Prof B', 'profB@example.com', 'professor');
const { token: studentAuthToken } = await registerAndLoginUserAndReturnToken('Stu B', 'stuB@example.com', 'student');

    const createAvailabilityResponse = await request(app)
  .post('/availability')
  .set('Authorization', `Bearer ${professorAuthToken}`)
  .send({ date: '2025-02-01', timeSlot: '11:00-11:30' });
expect(createAvailabilityResponse.status).toBe(201);

    const availableSlotsResponse = await request(app).get(`/availability/${professorId}`);
const availabilityId = availableSlotsResponse.body[0].id;

    const createAppointmentResponse = await request(app)
  .post('/appointments')
  .set('Authorization', `Bearer ${studentAuthToken}`)
  .send({ professorId: availableSlotsResponse.body[0].professorId, availabilityId });
expect(createAppointmentResponse.status).toBe(201);

    const doubleBookAttemptResponse = await request(app)
  .post('/appointments')
  .set('Authorization', `Bearer ${studentAuthToken}`)
  .send({ professorId: availableSlotsResponse.body[0].professorId, availabilityId });
expect(doubleBookAttemptResponse.status).toBe(400);

    const professorBookingAttemptResponse = await request(app)
  .post('/appointments')
  .set('Authorization', `Bearer ${professorAuthToken}`)
  .send({ professorId: availableSlotsResponse.body[0].professorId, availabilityId });
expect(professorBookingAttemptResponse.status).toBe(403);
  });

  test('View and cancel: student sees only own; professor sees theirs; cancel hides from student default view', async () => {
    const { token: professorTwoAuthToken, id: professorTwoId } = await registerAndLoginUserAndReturnToken('Prof C', 'profC@example.com', 'professor');
const { token: studentOneAuthToken } = await registerAndLoginUserAndReturnToken('Stu C1', 'stuC1@example.com', 'student');
const { token: studentTwoAuthToken } = await registerAndLoginUserAndReturnToken('Stu C2', 'stuC2@example.com', 'student');

    const createAvailabilityResponseTwo = await request(app)
  .post('/availability')
  .set('Authorization', `Bearer ${professorTwoAuthToken}`)
  .send({ date: '2025-03-01', timeSlot: '12:00-12:30' });
expect(createAvailabilityResponseTwo.status).toBe(201);

    const professorAvailabilityResponse = await request(app).get(`/availability/${professorTwoId}`);
const selectedAvailabilitySlot = professorAvailabilityResponse.body[0];

    const createAppointmentResponseTwo = await request(app)
  .post('/appointments')
  .set('Authorization', `Bearer ${studentOneAuthToken}`)
  .send({ professorId: selectedAvailabilitySlot.professorId, availabilityId: selectedAvailabilitySlot.id });
expect(createAppointmentResponseTwo.status).toBe(201);

    const studentOneAppointmentsResponse = await request(app).get('/appointments').set('Authorization', `Bearer ${studentOneAuthToken}`);
expect(studentOneAppointmentsResponse.status).toBe(200);
expect(studentOneAppointmentsResponse.body.length).toBe(1);

    const professorAppointmentsResponse = await request(app).get('/appointments').set('Authorization', `Bearer ${professorTwoAuthToken}`);
expect(professorAppointmentsResponse.status).toBe(200);
expect(professorAppointmentsResponse.body.length).toBe(1);

    const cancelAppointmentResponse = await request(app).delete(`/appointments/${createAppointmentResponseTwo.body.id}`).set('Authorization', `Bearer ${professorTwoAuthToken}`);
expect(cancelAppointmentResponse.status).toBe(200);

    const studentOneAppointmentsAfterCancelResponse = await request(app).get('/appointments').set('Authorization', `Bearer ${studentOneAuthToken}`);
expect(studentOneAppointmentsAfterCancelResponse.status).toBe(200);
expect(studentOneAppointmentsAfterCancelResponse.body.length).toBe(0);

    const studentTwoAppointmentsResponse = await request(app).get('/appointments').set('Authorization', `Bearer ${studentTwoAuthToken}`);
expect(studentTwoAppointmentsResponse.status).toBe(200);
expect(studentTwoAppointmentsResponse.body.length).toBe(0);

const professorAppointmentsAfterCancelResponse = await request(app).get('/appointments').set('Authorization', `Bearer ${professorTwoAuthToken}`);
expect(professorAppointmentsAfterCancelResponse.status).toBe(200);
expect(professorAppointmentsAfterCancelResponse.body.length).toBe(0);
  });

  test('Booking non-existent availability returns 404', async () => {
    const { token: studentAuthTokenForMissing } = await registerAndLoginUserAndReturnToken('Stu D', 'stuD@example.com', 'student');
const bookMissingAvailabilityResponse = await request(app)
  .post('/appointments')
  .set('Authorization', `Bearer ${studentAuthTokenForMissing}`)
  .send({ professorId: 9999, availabilityId: 9999 });
expect(bookMissingAvailabilityResponse.status).toBe(404);
  });

  test('Booking with mismatched professorId returns 400', async () => {
    const { token: professorOneAuthToken, id: professorOneId } = await registerAndLoginUserAndReturnToken('Prof D', 'profD@example.com', 'professor');
const { token: professorTwoAuthTokenBooking } = await registerAndLoginUserAndReturnToken('Prof E', 'profE@example.com', 'professor');
const { token: studentAuthTokenForMismatch } = await registerAndLoginUserAndReturnToken('Stu E', 'stuE@example.com', 'student');

    const a1 = await request(app)
      .post('/availability')
      .set('Authorization', `Bearer ${professorOneAuthToken}`)
      .send({ date: '2025-05-01', timeSlot: '14:00-14:30' });
    expect(a1.status).toBe(201);

    const availabilityForProfessorOneResponse = await request(app).get(`/availability/${professorOneId}`);
const firstAvailabilitySlotForProfessorOne = availabilityForProfessorOneResponse.body[0];

    const mismatchedProfessorBookingResponse = await request(app)
  .post('/appointments')
  .set('Authorization', `Bearer ${studentAuthTokenForMismatch}`)
  .send({ professorId: 123456, availabilityId: firstAvailabilitySlotForProfessorOne.id });
expect(mismatchedProfessorBookingResponse.status).toBe(400);
  });

  test('Students cannot cancel appointments; only the professor can', async () => {
    const { token: professorAuthTokenForCancel, id: professorIdForCancel } = await registerAndLoginUserAndReturnToken('Prof F', 'profF@example.com', 'professor');
const { token: studentAuthTokenForCancel } = await registerAndLoginUserAndReturnToken('Stu F', 'stuF@example.com', 'student');

await request(app)
  .post('/availability')
  .set('Authorization', `Bearer ${professorAuthTokenForCancel}`)
  .send({ date: '2025-06-01', timeSlot: '15:00-15:30' });

const availabilityForCancelProfessorResponse = await request(app).get(`/availability/${professorIdForCancel}`);
const slotForCancel = availabilityForCancelProfessorResponse.body[0];

const createAppointmentForCancelResponse = await request(app)
  .post('/appointments')
  .set('Authorization', `Bearer ${studentAuthTokenForCancel}`)
  .send({ professorId: slotForCancel.professorId, availabilityId: slotForCancel.id });
expect(createAppointmentForCancelResponse.status).toBe(201);

const studentCancelAttemptResponse = await request(app)
  .delete(`/appointments/${createAppointmentForCancelResponse.body.id}`)
  .set('Authorization', `Bearer ${studentAuthTokenForCancel}`);
expect(studentCancelAttemptResponse.status).toBe(403);
  });
});
