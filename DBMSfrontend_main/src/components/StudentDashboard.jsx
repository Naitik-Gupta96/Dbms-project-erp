import { useEffect, useState } from 'react';
import {
  studentDropCourse,
  studentFetchAvailableCourses,
  studentFetchAnnouncements,
  studentFetchCourses,
  studentFetchProfile,
  studentFetchTimetable,
  studentRegisterCourse,
} from '../api.js';

function StudentDashboard({ onMessage }) {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [registrationId, setRegistrationId] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [profileData, coursesData, availableCoursesData, announcementsData, timetableData] = await Promise.all([
        studentFetchProfile(),
        studentFetchCourses(),
        studentFetchAvailableCourses(),
        studentFetchAnnouncements(),
        studentFetchTimetable(),
      ]);
      setProfile(profileData);
      setCourses(coursesData);
      setAvailableCourses(availableCoursesData);
      setAnnouncements(announcementsData);
      setTimetable(timetableData);
    } catch (err) {
      onMessage(err.message);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setBusy(true);
    onMessage('');

    try {
      const result = await studentRegisterCourse(registrationId);
      onMessage(result.message || 'Course registered');
      setRegistrationId('');
      await loadAll();
    } catch (err) {
      onMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDrop(courseId) {
    if (!window.confirm('Drop this course?')) return;
    setBusy(true);
    onMessage('');
    try {
      const result = await studentDropCourse(courseId);
      onMessage(result.message || 'Course dropped');
      await loadAll();
    } catch (err) {
      onMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h3>Profile</h3>
        {profile ? (
          <div className="entity-card">
            <p><strong>{profile.first_name} {profile.last_name}</strong></p>
            <p>{profile.email}</p>
            <p>Roll No: {profile.roll_no || 'N/A'}</p>
          </div>
        ) : (
          <p>Loading profile…</p>
        )}
      </div>

      <div className="card">
        <h3>Register for a course</h3>
        <form className="form-stack" onSubmit={handleRegister}>
          <select
            value={registrationId}
            onChange={(e) => setRegistrationId(e.target.value)}
            required
          >
            <option value="">Select a course</option>
            {availableCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.course_code} - {course.course_name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit" disabled={busy}>Register</button>
        </form>
        <p className="hint">
          {availableCourses.length > 0
            ? 'Only courses you have not already registered for are shown here.'
            : 'No open courses available right now.'}
        </p>
      </div>

      <div className="card full-width">
        <h3>Registered courses</h3>
        {courses.length === 0 ? (
          <p>No courses registered.</p>
        ) : (
          <ul className="item-list">
            {courses.map((item) => (
              <li key={item._id}>
                <strong>{item.course.course_code}</strong> — {item.course.course_name}
                <div>Professor: {item.course.professor.first_name} {item.course.professor.last_name}</div>
                <div>Course ID: {item.course._id}</div>
                <div>Credits: {item.course.credits}</div>
                <div>Marks: {item.marks ?? 'N/A'} | Grade: {item.grade || 'N/A'}</div>
                <div>
                  <button className="btn btn-danger" onClick={() => handleDrop(item.course._id)} disabled={busy}>
                    Drop course
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card full-width">
        <h3>Announcements</h3>
        {announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          <ul className="item-list">
            {announcements.map((item) => (
              <li key={item._id}>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <small>{item.course.course_code} by {item.professor.first_name} {item.professor.last_name}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card full-width">
        <h3>Timetable</h3>
        {timetable.length === 0 ? (
          <p>No timetable items found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Day</th>
                <th>Time</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((item) => (
                <tr key={item._id}>
                  <td>{item.course.course_code}</td>
                  <td>{item.day_of_week}</td>
                  <td>{item.start_time} - {item.end_time}</td>
                  <td>{item.room_no || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
