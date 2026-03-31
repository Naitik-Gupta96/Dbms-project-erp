const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { User, Course, Timetable, TakenCourse, Announcement } = require("../db");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function upsertUser({ email, role, first_name, last_name, password, roll_no, employee_id }) {
  const hashed = await bcrypt.hash(password, 10);
  return User.findOneAndUpdate(
    { email },
    {
      email,
      role,
      first_name,
      last_name,
      password: hashed,
      roll_no: roll_no || undefined,
      employee_id: employee_id || undefined
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function run() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is required. Create backend .env from .env.example");
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const profEmail = process.env.SEED_PROF_EMAIL || "prof@example.com";
  const profPassword = process.env.SEED_PROF_PASSWORD || "prof123";
  const studentEmail = process.env.SEED_STUDENT_EMAIL || "student@example.com";
  const studentPassword = process.env.SEED_STUDENT_PASSWORD || "student123";

  const admin = await upsertUser({
    email: adminEmail,
    role: "admin",
    first_name: "Default",
    last_name: "Admin",
    password: adminPassword
  });
  const prof = await upsertUser({
    email: profEmail,
    role: "prof",
    first_name: "Default",
    last_name: "Professor",
    password: profPassword,
    employee_id: "EMP-1001"
  });
  const student = await upsertUser({
    email: studentEmail,
    role: "student",
    first_name: "Default",
    last_name: "Student",
    password: studentPassword,
    roll_no: "ROLL-1001"
  });

  const course = await Course.findOneAndUpdate(
    { course_code: "DBMS101" },
    {
      course_code: "DBMS101",
      course_name: "Database Management Systems",
      credits: 4,
      professor: prof._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Timetable.findOneAndUpdate(
    { course: course._id, day_of_week: "Monday", start_time: "10:00" },
    {
      course: course._id,
      day_of_week: "Monday",
      start_time: "10:00",
      end_time: "11:00",
      room_no: "B-101"
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await TakenCourse.findOneAndUpdate(
    { student: student._id, course: course._id },
    { student: student._id, course: course._id, marks: 85, grade: "A" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Announcement.findOneAndUpdate(
    { course: course._id, professor: prof._id, title: "Welcome to DBMS101" },
    {
      title: "Welcome to DBMS101",
      message: "First lecture starts Monday 10:00 AM in B-101.",
      course: course._id,
      professor: prof._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Seed completed");
  console.log(`Admin:   ${adminEmail} / ${adminPassword}`);
  console.log(`Prof:    ${profEmail} / ${profPassword}`);
  console.log(`Student: ${studentEmail} / ${studentPassword}`);
}

run()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
