# DBMS Project (Beginner Guide)

This project is a simple Academic Portal with:

- Backend API (`DBMSbackend-main`) using Node.js + Express + MongoDB
- Frontend app (`DBMSfrontend_main`) using React + Vite

If you are new, follow this file from top to bottom.

## 1) Prerequisites

Install these first:

1. Node.js (LTS, v18+ recommended)
2. npm (comes with Node.js)
3. MongoDB Community Server (local) or MongoDB Atlas connection string
4. Git

Check install:

```powershell
node -v
npm -v
git --version
```

## 2) Project Structure

```text
DBMS_PROJECT/
  DBMSbackend-main/   # API server
  DBMSfrontend_main/  # React web app
```

## 3) Quick Start (Local, step-by-step)

Open terminal at project root (`DBMS_PROJECT`).

### Step A: Setup and run backend

```powershell
cd DBMSbackend-main
copy .env.example .env
npm install
npm run seed
npm start
```

What this does:

- Creates `.env` config file
- Installs backend dependencies
- Seeds sample users and data
- Starts backend at `http://localhost:3000`

Keep this terminal running.

Alternative (one-click):

- Double-click `start-backend.bat` from project root.
- This starts local MongoDB + backend in separate windows.

### Step B: Setup and run frontend

Open a second terminal:

```powershell
cd DBMSfrontend_main
copy .env.example .env
npm install
npm run dev
```

Frontend will run at:

- `http://localhost:5500`

## 4) Sample Login Credentials

After `npm run seed` in backend:

- Admin: `admin@example.com` / `admin123`
- Professor: `prof@example.com` / `prof123`
- Student: `student@example.com` / `student123`

## 5) Typical First Run Flow

1. Login as Admin and review users/courses/timetable
2. Login as Professor and post announcements/update marks
3. Login as Student and register/drop courses, view timetable/announcements

## 6) Run Tests and Build

From backend folder:

```powershell
npm test
```

From frontend folder:

```powershell
npm test
npm run build
```

## 7) Docker (Optional)

From root folder:

```powershell
docker compose up --build
```

Services:

- MongoDB: `localhost:27017`
- Backend: `localhost:3000`
- Frontend: `localhost:5500`

## 8) Common Errors (and fixes)

1. `MONGO_URI is missing`
- Fix: create backend `.env` from `.env.example`

2. `Invalid or expired token`
- Fix: login again (token timed out after 1 hour)

3. Frontend cannot reach backend
- Check backend is running on `3000`
- Check frontend `.env` has `VITE_API_URL=http://localhost:3000`

4. `npm` execution policy error in PowerShell
- Run commands via `cmd /c npm ...` or update your PowerShell execution policy

5. `spawn EPERM` when running `npm run dev` in backend
- Use `npm start` instead (watch mode may be blocked on some Windows setups)

## 10) Current Validation Status

- Backend API smoke-tested after setup:
  - `GET /` works
  - `POST /admin/signin` works
  - `GET /admin/users` works with Bearer token

## 9) Where to read next

- Backend details: [DBMSbackend-main/README.md](./DBMSbackend-main/README.md)
- Frontend details: [DBMSfrontend_main/README.md](./DBMSfrontend_main/README.md)
