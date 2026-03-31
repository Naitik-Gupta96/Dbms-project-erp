# DBMS Project Walkthrough 

## 1) Intro 



"This is a DBMS Academic Portal project with a React frontend and Node.js + MongoDB backend. I will show setup and all three roles: Admin, Professor, and Student."

Show:

- Project root folders:
  - `DBMSbackend-main`
  - `DBMSfrontend_main`

## 2) Start Backend (30-60 seconds)

Open terminal 1:

```powershell
cd DBMSbackend-main
copy .env.example .env
npm install
npm run seed
npm start
```

If this machine shows watch-mode errors, use `npm start` (already shown above) and do not use `npm run dev`.

Alternative :

- Double-click `start-backend.bat` from project root.

Say:

"Backend is running at localhost:3000 and sample data is seeded."

Show:

- Terminal output
- Seeded credentials printed in terminal

## 3) Start Frontend (20-40 seconds)

Open terminal 2:

```powershell
cd DBMSfrontend_main
copy .env.example .env
npm install
npm run dev
```

Open:

- `http://localhost:5500`

Say:

"Frontend is running at localhost:5500 and connected to backend."

## 4) Admin Demo 

Login with:

- Role: `admin`
- Email: `admin@example.com`
- Password: `admin123`

Show and narrate:

1. Users table is visible.
2. Create a new student from "Add student" form.
3. Create a new professor from "Add professor" form.
4. Create a course (choose a professor).
5. Create a timetable entry.
6. Show Courses table and Timetable table update.
7. Delete one test user/course/timetable entry (optional).

Say:

"Admin can manage users, courses, and timetable."

## 5) Professor Demo

Logout, then login with:

- Role: `prof`
- Email: `prof@example.com`
- Password: `prof123`

Show and narrate:

1. "Your courses" section.
2. "Enrolled students" list.
3. Update marks for a student.
4. Create an announcement.
5. Show announcement in "Your announcements".
6. Delete an announcement (optional).

Say:

"Professor can update marks and manage announcements for their own courses."

## 6) Student Demo 
Logout, then login with:

- Role: `student`
- Email: `student@example.com`
- Password: `student123`

Show and narrate:

1. Profile card.
2. Register for a course from dropdown.
3. Check course appears in registered courses.
4. Show marks/grade if available.
5. Show announcements section.
6. Show timetable section.
7. Drop a registered course using "Drop course" button.

Say:

"Student can register/drop courses and view announcements and timetable."

## 7) Quick API Health Check 

In browser or Postman:

- `GET http://localhost:3000/`

Expected:

- `Academic Portal API is running`

## 8) Common Troubleshooting to mention

1. If login fails: run backend seed again (`npm run seed`).
2. If frontend cannot load data: ensure backend terminal is still running.
3. If token expires: login again.

## 9) Outro 
Say:

"That was the complete DBMS portal flow across Admin, Professor, and Student roles."

## Optional: Recording Tips

1. Use 125% browser zoom so tables are readable.
2. Keep both backend and frontend terminals visible briefly.
3. Keep the script open on side screen to avoid pauses.
