# DBMS Frontend (Beginner Guide)

This is the web app for the Academic Portal.

- Tech: React + Vite
- Default URL: `http://localhost:5500`
- Talks to backend API on `http://localhost:3000` by default

## 1) Prerequisites

Install:

1. Node.js (v18+ recommended)
2. npm
3. Backend server running (recommended before starting frontend)

## 2) Setup and Run

From `DBMSfrontend_main`:

```powershell
copy .env.example .env
npm install
npm run dev
```

Open browser:

- `http://localhost:5500`

## 3) Environment Config

Use `.env.example` as template.

Main variable:

- `VITE_API_URL=http://localhost:3000`

Change this if backend is running on another host/port.

## 4) Scripts

- `npm run dev` -> run frontend locally
- `npm run build` -> create production build
- `npm run preview` -> preview built app
- `npm test` -> run frontend tests

## 5) Login Roles and Screens

You can login as:

- Admin
- Professor
- Student

Each role gets a different dashboard.

## 6) What each role can do

Admin:

- Add students and professors
- Create and delete courses
- Create and delete timetable entries
- View and delete users

Professor:

- View enrolled students in own courses
- Update marks and grades
- Create and delete announcements

Student:

- View profile
- View available/registered courses
- Register and drop courses
- View announcements and timetable

## 7) Common Issues

1. Blank data in dashboard
- Backend may not be running or has no seeded data.
- Run backend seed script: `npm run seed` in backend folder.

2. API request failed / network error
- Check `VITE_API_URL` in `.env`.
- Confirm backend is reachable at that URL.

3. Session automatically logs out
- Token expired; login again.

## 8) Useful Files

- `src/App.jsx` -> role-based app shell
- `src/api.js` -> all API calls
- `src/components/` -> role dashboards and login form
- `src/styles.css` -> shared styles
