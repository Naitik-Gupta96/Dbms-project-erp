const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Course, TakenCourse, Timetable, Announcement } = require("../db/index");
const authenticateJWT = require("../middleware/auth");
const isStudent = require("../middleware/student");
const {
  isValidObjectId,
  normalizeString
} = require("../utils/validation");
require("dotenv").config();

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const student = await User.findOne({ email: String(email).toLowerCase(), role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: student._id, email: student.email, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Signin failed", error: err.message });
  }
});

router.post("/register-course/:courseId", authenticateJWT, isStudent, async (req, res) => {
  const studentId = req.user.id;
  const courseId = normalizeString(req.params.courseId);

  try {
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await TakenCourse.findOne({ student: studentId, course: courseId });
    if (existing) return res.status(400).json({ message: "Already registered in this course" });

    const taken = new TakenCourse({ student: studentId, course: courseId });
    await taken.save();

    res.status(201).json({ message: "Course registered", takenCourse: taken });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

router.delete("/register-course/:courseId", authenticateJWT, isStudent, async (req, res) => {
  const studentId = req.user.id;
  const courseId = normalizeString(req.params.courseId);

  try {
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const deleted = await TakenCourse.findOneAndDelete({ student: studentId, course: courseId });
    if (!deleted) return res.status(404).json({ message: "Enrollment not found" });

    res.json({ message: "Course dropped successfully" });
  } catch (err) {
    res.status(500).json({ message: "Drop failed", error: err.message });
  }
});

router.get("/me", authenticateJWT, isStudent, async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile", error: err.message });
  }
});

router.get("/my-courses", authenticateJWT, isStudent, async (req, res) => {
  try {
    const taken = await TakenCourse.find({ student: req.user.id }).populate({
      path: "course",
      populate: { path: "professor", select: "first_name last_name email employee_id" }
    });
    res.json(taken);
  } catch (err) {
    res.status(500).json({ message: "Failed to load registered courses", error: err.message });
  }
});

router.get("/available-courses", authenticateJWT, isStudent, async (req, res) => {
  try {
    const taken = await TakenCourse.find({ student: req.user.id }).select("course");
    const takenCourseIds = taken.map((item) => item.course);

    const courses = await Course.find({ _id: { $nin: takenCourseIds } })
      .populate("professor", "first_name last_name email employee_id")
      .sort({ course_code: 1 });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to load available courses", error: err.message });
  }
});

router.get("/my-announcements", authenticateJWT, isStudent, async (req, res) => {
  try {
    const taken = await TakenCourse.find({ student: req.user.id }).select("course");
    const courseIds = taken.map((item) => item.course);

    const announcements = await Announcement.find({ course: { $in: courseIds } })
      .populate("course", "course_code course_name")
      .populate("professor", "first_name last_name email")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Failed to load announcements", error: err.message });
  }
});

router.get("/my-timetable", authenticateJWT, isStudent, async (req, res) => {
  try {
    const taken = await TakenCourse.find({ student: req.user.id }).select("course");
    const courseIds = taken.map((item) => item.course);

    const timetable = await Timetable.find({ course: { $in: courseIds } })
      .populate("course", "course_code course_name")
      .sort({ day_of_week: 1, start_time: 1 });

    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: "Failed to load timetable", error: err.message });
  }
});

module.exports = router;
