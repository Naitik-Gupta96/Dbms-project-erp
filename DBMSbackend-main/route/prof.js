const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Course, TakenCourse, Announcement } = require("../db/index");
const authenticateJWT = require("../middleware/auth");
const isProf = require("../middleware/prof");
const {
  assertRequiredFields,
  isValidObjectId,
  normalizeString,
  parseOptionalNumber
} = require("../utils/validation");
require("dotenv").config();

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const prof = await User.findOne({ email: String(email).toLowerCase(), role: "prof" });
    if (!prof) return res.status(404).json({ message: "Professor not found" });

    const valid = await bcrypt.compare(password, prof.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: prof._id, email: prof.email, role: prof.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Signin failed", error: err.message });
  }
});

router.get("/students", authenticateJWT, isProf, async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id }).select("_id");
    const courseIds = courses.map((item) => item._id);

    const enrollments = await TakenCourse.find({ course: { $in: courseIds } })
      .populate("student", "first_name last_name email roll_no")
      .populate("course", "course_code course_name");

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Failed to load students", error: err.message });
  }
});

router.get("/courses", authenticateJWT, isProf, async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id }).sort({ course_code: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to load courses", error: err.message });
  }
});

router.patch("/marks", authenticateJWT, isProf, async (req, res) => {
  try {
    const studentId = normalizeString(req.body.studentId);
    const courseId = normalizeString(req.body.courseId);
    const marks = parseOptionalNumber(req.body.marks);
    const grade = normalizeString(req.body.grade);

    const missingError = assertRequiredFields({ studentId, courseId }, ["studentId", "courseId"]);
    if (missingError) return res.status(400).json({ message: missingError });
    if (!isValidObjectId(studentId) || !isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid studentId or courseId" });
    }
    if (marks !== undefined && (marks === null || marks < 0 || marks > 100)) {
      return res.status(400).json({ message: "Marks must be between 0 and 100" });
    }

    const course = await Course.findOne({ _id: courseId, professor: req.user.id });
    if (!course) return res.status(403).json({ message: "You do not teach this course" });

    const updated = await TakenCourse.findOneAndUpdate(
      { student: studentId, course: courseId },
      { marks, grade },
      { new: true }
    )
      .populate("student", "first_name last_name email roll_no")
      .populate("course", "course_code course_name");

    if (!updated) return res.status(404).json({ message: "Enrollment not found" });
    res.json({ message: "Marks updated", enrollment: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update marks", error: err.message });
  }
});

router.post("/announcements", authenticateJWT, isProf, async (req, res) => {
  try {
    const courseId = normalizeString(req.body.courseId);
    const title = normalizeString(req.body.title);
    const message = normalizeString(req.body.message);

    const missingError = assertRequiredFields({ courseId, title, message }, ["courseId", "title", "message"]);
    if (missingError) return res.status(400).json({ message: missingError });
    if (!isValidObjectId(courseId)) return res.status(400).json({ message: "Invalid courseId" });

    const course = await Course.findOne({ _id: courseId, professor: req.user.id });
    if (!course) return res.status(403).json({ message: "You do not teach this course" });

    const announcement = new Announcement({
      title,
      message,
      course: courseId,
      professor: req.user.id
    });
    await announcement.save();

    res.status(201).json({ message: "Announcement created", announcement });
  } catch (err) {
    res.status(500).json({ message: "Failed to create announcement", error: err.message });
  }
});

router.get("/announcements", authenticateJWT, isProf, async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id }).select("_id");
    const courseIds = courses.map((item) => item._id);

    const announcements = await Announcement.find({
      course: { $in: courseIds },
      professor: req.user.id
    })
      .populate("course", "course_code course_name")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Failed to load announcements", error: err.message });
  }
});

router.patch("/announcements/:id", authenticateJWT, isProf, async (req, res) => {
  try {
    const announcementId = req.params.id;
    if (!isValidObjectId(announcementId)) {
      return res.status(400).json({ message: "Invalid announcement id" });
    }

    const payload = {};
    if (req.body.title !== undefined) payload.title = normalizeString(req.body.title);
    if (req.body.message !== undefined) payload.message = normalizeString(req.body.message);

    const updated = await Announcement.findOneAndUpdate(
      { _id: announcementId, professor: req.user.id },
      payload,
      { new: true }
    ).populate("course", "course_code course_name");

    if (!updated) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement updated", announcement: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update announcement", error: err.message });
  }
});

router.delete("/announcements/:id", authenticateJWT, isProf, async (req, res) => {
  try {
    const announcementId = req.params.id;
    if (!isValidObjectId(announcementId)) {
      return res.status(400).json({ message: "Invalid announcement id" });
    }

    const deleted = await Announcement.findOneAndDelete({
      _id: announcementId,
      professor: req.user.id
    });
    if (!deleted) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete announcement", error: err.message });
  }
});

module.exports = router;
