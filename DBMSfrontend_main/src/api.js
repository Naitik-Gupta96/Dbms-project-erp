const DEFAULT_API_BASE =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://localhost:3000';

const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;

function getToken() {
  return localStorage.getItem('dbmsToken');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    method: options.method || 'GET',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 400 && data.message === 'Invalid or Expired token') {
      clearToken();
      localStorage.removeItem('dbmsRole');
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export async function signIn(role, payload) {
  return request(`/${role}/signin`, { method: 'POST', body: payload });
}

export async function adminSignUp(payload) {
  return request('/admin/signup', { method: 'POST', body: payload });
}

export async function adminCreateStudent(payload) {
  return request('/admin/students', { method: 'POST', body: payload });
}

export async function adminCreateProf(payload) {
  return request('/admin/profs', { method: 'POST', body: payload });
}

export async function adminCreateCourse(payload) {
  return request('/admin/courses', { method: 'POST', body: payload });
}

export async function adminCreateTimetable(payload) {
  return request('/admin/timetable', { method: 'POST', body: payload });
}

export async function adminFetchUsers() {
  return request('/admin/users');
}

export async function profFetchStudents() {
  return request('/prof/students');
}

export async function profFetchCourses() {
  return request('/prof/courses');
}

export async function profUpdateMarks(payload) {
  return request('/prof/marks', { method: 'PATCH', body: payload });
}

export async function profCreateAnnouncement(payload) {
  return request('/prof/announcements', { method: 'POST', body: payload });
}

export async function studentFetchProfile() {
  return request('/student/me');
}

export async function studentFetchCourses() {
  return request('/student/my-courses');
}

export async function studentFetchAvailableCourses() {
  return request('/student/available-courses');
}

export async function studentFetchAnnouncements() {
  return request('/student/my-announcements');
}

export async function studentFetchTimetable() {
  return request('/student/my-timetable');
}

export async function studentRegisterCourse(courseId) {
  return request(`/student/register-course/${courseId}`, { method: 'POST' });
}

export function saveToken(token) {
  localStorage.setItem('dbmsToken', token);
}

export function clearToken() {
  localStorage.removeItem('dbmsToken');
}

export function getSavedToken() {
  return getToken();
}
