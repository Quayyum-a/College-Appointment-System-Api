# College Appointment System API

Backend API built with Node.js, Express, Sequelize (MySQL), JWT, and Jest (unit + E2E tests).

## Tech Stack
- Node.js + Express.js
- MySQL (dev/prod) via Sequelize ORM
- JWT Authentication
- Jest + Supertest (unit + E2E)

## Environment
Create a `.env` (see `.env.example`):
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET, JWT_EXPIRES_IN
- PORT

Note: Tests run with SQLite in-memory automatically (NODE_ENV=test). Dev/Prod use MySQL.

## Install & Run
```
npm install
npm run dev
```
Server: GET /health -> { ok: true }

## Testing
```
npm test
```
All tests run with SQLite in-memory and reset schema per test suite.

## Database
Sequelize sync is used for schema creation. In production, configure MySQL via env vars.

## Endpoints (for Postman)
- POST /auth/register -> Register student/professor
- POST /auth/login -> Login and get JWT
- POST /availability -> Professor adds availability (auth: professor)
- GET /availability/:professorId -> Student views available slots
- POST /appointments -> Student books appointment (auth: student)
- GET /appointments -> View all student/professor appointments (booked only)
- DELETE /appointments/:id -> Professor cancels appointment

## Roles & Rules
- Roles: student, professor
- Overlap prevention: same (professorId, date, timeSlot) unique
- Booking: only free slots; double-booking prevented
- Listing: default returns only status=booked (cancelled hidden)
- Cancel: professor owning appointment can cancel; status=cancelled; slot freed

## Notes
- Use Postman to test endpoints with Authorization: Bearer <token>
- Keep controllers slim; business logic in services; centralized error handling.
