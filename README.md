## Tech Stack
- Node.js + Express.js
- MySQL (dev/prod) via Sequelize ORM
- JWT Authentication
- Jest 



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
