# DBMS Backend (Beginner Guide)

This is the API server for the Academic Portal.

- Tech: Node.js, Express, MongoDB, Mongoose, JWT auth
- Default URL: `http://localhost:3000`

## 1) Prerequisites

Install:

1. Node.js (v18+ recommended)
2. npm
3. MongoDB (local) or Atlas connection string

Check:

```powershell
node -v
npm -v
```

## 2) Setup and Run

From `DBMSbackend-main` folder:

```powershell
copy .env.example .env
npm install
npm run seed
npm start
```

Backend starts on `http://localhost:3000`.

One-click option from project root:

```powershell
start-backend.bat
```

This starts:

- Local MongoDB (`127.0.0.1:27017`)
- Backend (`http://localhost:3000`)

## 3) Environment Variables

Use `.env.example` as template.

Required:

- `MONGO_URI` (database connection string)
- `JWT_SECRET` (long random secret string)

Optional:

- `PORT` (default `3000`)
- `CORS_ORIGIN` (default `http://localhost:5500`)

Seed options:

- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
- `SEED_PROF_EMAIL`, `SEED_PROF_PASSWORD`
- `SEED_STUDENT_EMAIL`, `SEED_STUDENT_PASSWORD`

## 4) Scripts

- `npm start` -> start backend once
- `npm run dev` -> start backend in watch mode
- `npm run seed` -> insert sample data
- `npm test` -> run backend tests

Note:

- If `npm run dev` fails with `spawn EPERM`, use `npm start`.

## 5) First API Calls (quick)

### Health check

`GET /`

Expected response:

`Academic Portal API is running`

### Login endpoints

- `POST /admin/signin`
- `POST /prof/signin`
- `POST /student/signin`

Body:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Use returned token in protected requests:

`Authorization: Bearer <token>`

## 6) Feature Coverage

Admin:

- Create/list/update/delete users
- Create/list/update/delete courses
- Create/list/update/delete timetable entries

Professor:

- View own courses and enrolled students
- Update student marks
- Create/list/update/delete announcements

Student:

- View profile, courses, announcements, timetable
- Register for a course
- Drop a course

## 7) Common Issues

1. `MONGO_URI is missing`
- You did not create `.env` or forgot to set `MONGO_URI`.

2. `Invalid or expired token`
- Login again and use the fresh token.

3. `Access denied`
- You are logged in with the wrong role for that route.

4. Mongo connection errors
- Check Mongo service is running.
- Verify `MONGO_URI` is correct.

5. `connect ECONNREFUSED 127.0.0.1:27017`
- MongoDB is not running. Start Mongo first, then backend.

## 8) Project Files You Will Use Most

- `index.js` -> app startup
- `db/index.js` -> models
- `route/` -> API routes
- `middleware/` -> auth + role checks
- `scripts/seed.js` -> sample data setup
