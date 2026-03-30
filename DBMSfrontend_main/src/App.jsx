import { useEffect, useState } from 'react';
import { clearToken, getSavedToken, saveToken } from './api.js';
import LoginForm from './components/LoginForm.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ProfDashboard from './components/ProfDashboard.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';

const ROLE_NAMES = ['admin', 'prof', 'student'];

function App() {
  const [role, setRole] = useState(localStorage.getItem('dbmsRole') || '');
  const [token, setToken] = useState(getSavedToken());
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setRole('');
      localStorage.removeItem('dbmsRole');
    }
  }, [token]);

  function handleLoginSuccess(roleName, authToken) {
    saveToken(authToken);
    localStorage.setItem('dbmsRole', roleName);
    setRole(roleName);
    setToken(authToken);
    setMessage('Login successful.');
  }

  function handleLogout() {
    clearToken();
    localStorage.removeItem('dbmsRole');
    setRole('');
    setToken('');
    setMessage('Logged out successfully.');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Academic Portal</h1>
        <p>React frontend for DBMS backend</p>
      </header>

      {message && <div className="toast">{message}</div>}

      {!token ? (
        <section className="panel">
          <h2>Sign in</h2>
          <LoginForm
            roles={ROLE_NAMES}
            onSuccess={handleLoginSuccess}
            onError={(error) => setMessage(error)}
          />
          <div className="notice">
            Use one of the backend roles: admin, prof, student. The frontend runs on <strong>http://localhost:5500</strong> and talks to the backend on <strong>http://localhost:3000</strong> unless you override <code>VITE_API_URL</code>.
          </div>
        </section>
      ) : (
        <section className="panel">
          <div className="panel-toolbar">
            <span>Signed in as <strong>{role}</strong></span>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>

          {role === 'admin' && <AdminDashboard onMessage={setMessage} />}
          {role === 'prof' && <ProfDashboard onMessage={setMessage} />}
          {role === 'student' && <StudentDashboard onMessage={setMessage} />}
        </section>
      )}

      <footer className="app-footer">
        <small>Frontend built for the DBMS backend API.</small>
      </footer>
    </div>
  );
}

export default App;
