const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Course, Timetable, TakenCourse, Announcement } = require("../db/index");
const authenticateJWT = require("../middleware/auth");
const isAdmin = require("../middleware/admin");
const {
  assertRequiredFields,
  isValidObjectId,
  normalizeString,
  parseOptionalNumber
} = require("../utils/validation");
require("dotenv").config();

const VALID_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

function toCleanUserPayload(payload) {
  return {
    first_name: normalizeString(payload.first_name),
    last_name: normalizeString(payload.last_name),
    email: normalizeString(payload.email)?.toLowerCase(),
    password: payload.password,
    roll_no: normalizeString(payload.roll_no),
    employee_id: normalizeString(payload.employee_id)
  };
}

router.post("/signup", async (req, res) => {
  try {
    const payload = toCleanUserPayload(req.body);
    const missingError = assertRequiredFields(payload, ["first_name", "last_name", "email", "password"]);
    if (missingError) return res.status(400).json({ message: missingError });

    const existing = await User.findOne({ email: payload.email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash(payload.password, 10);
    const admin = new User({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      password: hashed,
      role: "admin"
    });
    await admin.save();

    res.status(201).json({ message: "Admin registered", adminId: admin._id });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await User.findOne({ email: String(email).toLowerCase(), role: "admin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Signin failed", error: err.message });
  }
});

router.post("/students", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const payload = toCleanUserPayload(req.body);
    const missingError = assertRequiredFields(payload, ["first_name", "last_name", "email", "password"]);
    if (missingError) return res.status(400).json({ message: missingError });

    const existing = await User.findOne({ email: payload.email });
    if (existing) return res.status(400).json({ message: "Student already exists" });

    const hashed = await bcrypt.hash(payload.password, 10);
    const student = new User({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      password: hashed,
      role: "student",
      roll_no: payload.roll_no
    });
    await student.save();

    res.status(201).json({ message: "Student added", student });
  } catch (err) {
    res.status(500).json({ message: "Failed to add student", error: err.message });
  }
});

router.post("/profs", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const payload = toCleanUserPayload(req.body);
    const missingError = assertRequiredFields(payload, ["first_name", "last_name", "email", "password"]);
    if (missingError) return res.status(400).json({ message: missingError });

    const existing = await User.findOne({ email: payload.email });
    if (existing) return res.status(400).json({ message: "Professor already exists" });

    const hashed = await bcrypt.hash(payload.password, 10);
    const prof = new User({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      password: hashed,
      role: "prof",
      employee_id: payload.employee_id
    });
    await prof.save();

    res.status(201).json({ message: "Professor added", prof });
  } catch (err) {
    res.status(500).json({ message: "Failed to add professor", error: err.message });
  }
});

router.get("/users", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to load users", error: err.message });
  }
});

router.get("/users/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user", error: err.message });
  }
});

router.patch("/users/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const payload = {};
    const allowed = ["first_name", "last_name", "email", "password", "roll_no", "employee_id"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        payload[key] = normalizeString(req.body[key]);
      }
    }

    if (payload.email) {
      payload.email = payload.email.toLowerCase();
    }
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, payload, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
});

router.delete("/users/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ message: "Admin cannot delete own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "prof") {
      const courses = await Course.find({ professor: user._id }).select("_id");
      const courseIds = courses.map((course) => course._id);
      await Announcement.deleteMany({ course: { $in: courseIds } });
      await Timetable.deleteMany({ course: { $in: courseIds } });
      await TakenCourse.deleteMany({ course: { $in: courseIds } });
      await Course.deleteMany({ professor: user._id });
    }
    if (user.role === "student") {
      await TakenCourse.deleteMany({ student: user._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

router.post("/courses", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const course_code = normalizeString(req.body.course_code);
    const course_name = normalizeString(req.body.course_name);
    const professor = normalizeString(req.body.professor);
    const credits = parseOptionalNumber(req.body.credits);

    const missingError = assertRequiredFields({ course_code, course_name, professor }, ["course_code", "course_name", "professor"]);
    if (missingError) return res.status(400).json({ message: missingError });
    if (!isValidObjectId(professor)) return res.status(400).json({ message: "Invalid professor id" });
    if (credits === null || credits === undefined || credits < 1) {
      return res.status(400).json({ message: "Credits must be a positive number" });
    }

    const prof = await User.findOne({ _id: professor, role: "prof" });
    if (!prof) return res.status(400).json({ message: "Professor not found" });

    const course = new Course({ course_code, course_name, credits, professor });
    await course.save();
    res.status(201).json({ message: "Course added", course });
  } catch (err) {
    res.status(500).json({ message: "Failed to add course", error: err.message });
  }
});

router.get("/courses", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("professor", "first_name last_name email employee_id")
      .sort({ course_code: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to load courses", error: err.message });
  }
});

router.patch("/courses/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const payload = {};
    if (req.body.course_code !== undefined) payload.course_code = normalizeString(req.body.course_code);
    if (req.body.course_name !== undefined) payload.course_name = normalizeString(req.body.course_name);
    if (req.body.credits !== undefined) {
      const credits = parseOptionalNumber(req.body.credits);
      if (credits === null || credits < 1) {
        return res.status(400).json({ message: "Credits must be a positive number" });
      }
      payload.credits = credits;
    }
    if (req.body.professor !== undefined) {
      const professorId = normalizeString(req.body.professor);
      if (!isValidObjectId(professorId)) {
        return res.status(400).json({ message: "Invalid professor id" });
      }
      const prof = await User.findOne({ _id: professorId, role: "prof" });
      if (!prof) return res.status(400).json({ message: "Professor not found" });
      payload.professor = professorId;
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course updated", course: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating course", error: err.message });
  }
});

router.delete("/courses/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await Announcement.deleteMany({ course: course._id });
    await Timetable.deleteMany({ course: course._id });
    await TakenCourse.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(course._id);

    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete course", error: err.message });
  }
});

router.post("/timetable", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const course = normalizeString(req.body.course);
    const day_of_week = normalizeString(req.body.day_of_week);
    const start_time = normalizeString(req.body.start_time);
    const end_time = normalizeString(req.body.end_time);
    const room_no = normalizeString(req.body.room_no);

    const missingError = assertRequiredFields({ course, day_of_week, start_time, end_time }, ["course", "day_of_week", "start_time", "end_time"]);
    if (missingError) return res.status(400).json({ message: missingError });
    if (!isValidObjectId(course)) return res.status(400).json({ message: "Invalid course id" });
    if (!VALID_DAYS.includes(day_of_week)) {
      return res.status(400).json({ message: "day_of_week is invalid" });
    }

    const existingCourse = await Course.findById(course);
    if (!existingCourse) return res.status(404).json({ message: "Course not found" });

    const timetable = new Timetable({ course, day_of_week, start_time, end_time, room_no });
    await timetable.save();
    res.status(201).json({ message: "Timetable created", timetable });
  } catch (err) {
    res.status(500).json({ message: "Failed to create timetable", error: err.message });
  }
});

router.get("/timetable", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const timetable = await Timetable.find()
      .populate({
        path: "course",
        populate: { path: "professor", select: "first_name last_name email employee_id" }
      })
      .sort({ day_of_week: 1, start_time: 1 });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: "Failed to load timetable", error: err.message });
  }
});

router.patch("/timetable/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid timetable id" });
    }

    const payload = {};
    if (req.body.course !== undefined) {
      const courseId = normalizeString(req.body.course);
      if (!isValidObjectId(courseId)) return res.status(400).json({ message: "Invalid course id" });
      const existingCourse = await Course.findById(courseId);
      if (!existingCourse) return res.status(404).json({ message: "Course not found" });
      payload.course = courseId;
    }
    if (req.body.day_of_week !== undefined) {
      const day = normalizeString(req.body.day_of_week);
      if (!VALID_DAYS.includes(day)) return res.status(400).json({ message: "day_of_week is invalid" });
      payload.day_of_week = day;
    }
    if (req.body.start_time !== undefined) payload.start_time = normalizeString(req.body.start_time);
    if (req.body.end_time !== undefined) payload.end_time = normalizeString(req.body.end_time);
    if (req.body.room_no !== undefined) payload.room_no = normalizeString(req.body.room_no);

    const updated = await Timetable.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Timetable not found" });
    res.json({ message: "Timetable updated", timetable: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating timetable", error: err.message });
  }
});

router.delete("/timetable/:id", authenticateJWT, isAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid timetable id" });
    }
    const deleted = await Timetable.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Timetable not found" });
    res.json({ message: "Timetable deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete timetable", error: err.message });
  }
});

module.exports = router;
