import { useEffect, useState } from 'react';
import {
  adminCreateCourse,
  adminCreateProf,
  adminCreateStudent,
  adminCreateTimetable,
  adminDeleteCourse,
  adminDeleteTimetable,
  adminDeleteUser,
  adminFetchCourses,
  adminFetchTimetable,
  adminFetchUsers,
} from '../api.js';

function AdminDashboard({ onMessage }) {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const profs = users.filter((user) => user.role === 'prof');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [userData, courseData, timetableData] = await Promise.all([
        adminFetchUsers(),
        adminFetchCourses(),
        adminFetchTimetable(),
      ]);
      setUsers(userData);
      setCourses(courseData);
      setTimetable(timetableData);
    } catch (err) {
      onMessage(err.message);
    }
  }

  async function handleSubmit(event, action) {
    event.preventDefault();
    setBusy(true);
    onMessage('');

    try {
      let result;
      if (action === 'student') {
        result = await adminCreateStudent({
          first_name: form.studentFirstName,
          last_name: form.studentLastName,
          email: form.studentEmail,
          password: form.studentPassword,
          roll_no: form.studentRollNo,
        });
      } else if (action === 'prof') {
        result = await adminCreateProf({
          first_name: form.profFirstName,
          last_name: form.profLastName,
          email: form.profEmail,
          password: form.profPassword,
          employee_id: form.profEmployeeId,
        });
      } else if (action === 'course') {
        result = await adminCreateCourse({
          course_code: form.courseCode,
          course_name: form.courseName,
          credits: Number(form.courseCredits),
          professor: form.courseProfessorId,
        });
      } else if (action === 'timetable') {
        result = await adminCreateTimetable({
          course: form.timetableCourseId,
          day_of_week: form.timetableDay,
          start_time: form.timetableStart,
          end_time: form.timetableEnd,
          room_no: form.timetableRoom,
        });
      }

      onMessage(result.message || 'Saved successfully');
      await loadData();
      setForm({});
    } catch (err) {
      onMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteUser(user) {
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    setBusy(true);
    try {
      const result = await adminDeleteUser(user._id);
      onMessage(result.message || 'User deleted');
      await loadData();
    } catch (err) {
      onMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCourse(course) {
    if (!window.confirm(`Delete course ${course.course_code}?`)) return;
    setBusy(true);
    try {
      const result = await adminDeleteCourse(course._id);
      onMessage(result.message || 'Course deleted');
      await loadData();
    } catch (err) {
      onMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteTimetable(entry) {
    if (!window.confirm(`Delete timetable entry for ${entry.course?.course_code || 'course'}?`)) return;
    setBusy(true);
    try {
      const result = await adminDeleteTimetable(entry._id);
      onMessage(result.message || 'Timetable entry deleted');
      await loadData();
    } catch (err) {
      onMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h3>Admin tools</h3>
        <form className="form-stack" onSubmit={(event) => handleSubmit(event, 'student')}>
          <h4>Add student</h4>
          <input placeholder="First name" value={form.studentFirstName || ''} onChange={(e) => setForm({ ...form, studentFirstName: e.target.value })} required />
          <input placeholder="Last name" value={form.studentLastName || ''} onChange={(e) => setForm({ ...form, studentLastName: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.studentEmail || ''} onChange={(e) => setForm({ ...form, studentEmail: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.studentPassword || ''} onChange={(e) => setForm({ ...form, studentPassword: e.target.value })} required />
          <input placeholder="Roll No" value={form.studentRollNo || ''} onChange={(e) => setForm({ ...form, studentRollNo: e.target.value })} />
          <button className="btn btn-primary" type="submit" disabled={busy}>Create student</button>
        </form>

        <form className="form-stack" onSubmit={(event) => handleSubmit(event, 'prof')}>
          <h4>Add professor</h4>
          <input placeholder="First name" value={form.profFirstName || ''} onChange={(e) => setForm({ ...form, profFirstName: e.target.value })} required />
          <input placeholder="Last name" value={form.profLastName || ''} onChange={(e) => setForm({ ...form, profLastName: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.profEmail || ''} onChange={(e) => setForm({ ...form, profEmail: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.profPassword || ''} onChange={(e) => setForm({ ...form, profPassword: e.target.value })} required />
          <input placeholder="Employee ID" value={form.profEmployeeId || ''} onChange={(e) => setForm({ ...form, profEmployeeId: e.target.value })} />
          <button className="btn btn-primary" type="submit" disabled={busy}>Create professor</button>
        </form>
      </div>

      <div className="card">
        <form className="form-stack" onSubmit={(event) => handleSubmit(event, 'course')}>
          <h4>Create course</h4>
          <input placeholder="Course code" value={form.courseCode || ''} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} required />
          <input placeholder="Course name" value={form.courseName || ''} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
          <input placeholder="Credits" type="number" min="1" value={form.courseCredits || ''} onChange={(e) => setForm({ ...form, courseCredits: e.target.value })} required />
          <select
            value={form.courseProfessorId || ''}
            onChange={(e) => setForm({ ...form, courseProfessorId: e.target.value })}
            required
          >
            <option value="">Select professor</option>
            {profs.map((prof) => (
              <option key={prof._id} value={prof._id}>
                {prof.first_name} {prof.last_name} ({prof.employee_id || prof.email})
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit" disabled={busy}>Create course</button>
        </form>

        <form className="form-stack" onSubmit={(event) => handleSubmit(event, 'timetable')}>
          <h4>Create timetable entry</h4>
          <select
            value={form.timetableCourseId || ''}
            onChange={(e) => setForm({ ...form, timetableCourseId: e.target.value })}
            required
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.course_code} - {course.course_name}
              </option>
            ))}
          </select>
          <select
            value={form.timetableDay || ''}
            onChange={(e) => setForm({ ...form, timetableDay: e.target.value })}
            required
          >
            <option value="">Select day</option>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <input placeholder="Start time (HH:mm)" value={form.timetableStart || ''} onChange={(e) => setForm({ ...form, timetableStart: e.target.value })} required />
          <input placeholder="End time (HH:mm)" value={form.timetableEnd || ''} onChange={(e) => setForm({ ...form, timetableEnd: e.target.value })} required />
          <input placeholder="Room no" value={form.timetableRoom || ''} onChange={(e) => setForm({ ...form, timetableRoom: e.target.value })} />
          <button className="btn btn-primary" type="submit" disabled={busy}>Create timetable</button>
        </form>
      </div>

      <div className="card full-width">
        <div className="panel-toolbar">
          <h3>Users</h3>
          <button className="btn btn-secondary" onClick={loadData} disabled={busy}>Reload</button>
        </div>
        {users.length === 0 ? (
          <p>No users loaded yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Name</th>
                <th>Reference</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.role === 'student' ? user.roll_no || 'N/A' : user.employee_id || 'N/A'}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDeleteUser(user)} disabled={busy}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card full-width">
        <h3>Courses</h3>
        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Credits</th>
                <th>Professor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.course_code}</td>
                  <td>{course.course_name}</td>
                  <td>{course.credits}</td>
                  <td>
                    {course.professor?.first_name} {course.professor?.last_name}
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDeleteCourse(course)} disabled={busy}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card full-width">
        <h3>Timetable</h3>
        {timetable.length === 0 ? (
          <p>No timetable entries.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Day</th>
                <th>Time</th>
                <th>Room</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((item) => (
                <tr key={item._id}>
                  <td>{item.course?.course_code || 'N/A'}</td>
                  <td>{item.day_of_week}</td>
                  <td>{item.start_time} - {item.end_time}</td>
                  <td>{item.room_no || 'N/A'}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDeleteTimetable(item)} disabled={busy}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
