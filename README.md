# College Appointment API

A simple REST API for students to book appointments with professors.

## How to Run
- Install: npm install
- Dev: npm run dev
- Prod: npm start
- Tests: npm test (uses in-memory SQLite)

Env (defaults exist): DB_* for MySQL, JWT_SECRET, JWT_EXPIRES_IN.

## Main Endpoints
- POST /auth/register — create user (student or professor)
- POST /auth/login — get a JWT token
- POST /availability — professor adds a time slot (auth: professor)
- GET /availability/:professorId — list open slots for a professor
- POST /appointments — student books a slot with availabilityId (auth: student)
- GET /appointments — list your booked appointments
- DELETE /appointments/:id — professor cancels a booking they own

## Request Examples
1) Register
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "pass1234",
  "role": "student"
}

2) Login
{
  "email": "alice@example.com",
  "password": "pass1234"
}

3) Add Availability (as professor)
Headers: Authorization: Bearer <your JWT>
{
  "date": "2025-02-01",
  "timeSlot": "11:00-11:30"
}

4) Book Appointment (as student)
Headers: Authorization: Bearer <your JWT>
{
  "availabilityId": 1
}

## Simple Rules (Business Logic)
- Roles: student, professor
- Booking: only unbooked slots; prevents double-booking
- Cancel: only the professor who owns the appointment can cancel
- Listing: returns only status = booked by default

## Recent Changes (Important)
- Auth
  - role must be one of: student, professor
  - email is trimmed + lowercased; uniqueness is case-insensitive
  - stronger password: min 8 characters, must include letters and numbers
- Availability
  - cannot create availability in the past (date must be today or future)
  - if date is today, the end time must be in the future (same day check)
  - prevents overlapping time ranges for the same professor and date (not just exact matches)
- Appointments
  - book with availabilityId only; the system infers the professorId from the availability

## Validation (Short)
- Auth: name length, email format, strong password, allowed role
- Availability: YYYY-MM-DD date, HH:MM-HH:MM slot, not past, end > start, same-day end in future
- Appointments: ids are positive integers

## Project Structure
- src/controllers — route handlers (thin)
- src/services — business logic
- src/routes — route definitions
- src/middleware/validation.js — small custom validators
- src/validators — per-feature validators
- src/models — Sequelize models
- src/tests — Jest tests

## Notes
- Use the JWT from /auth/login in the Authorization header when calling protected routes
- Keep controllers small; most logic lives in services
- Errors return JSON with a message and proper HTTP status codes
