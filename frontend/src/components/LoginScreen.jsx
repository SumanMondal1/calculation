import { useState } from 'react';
import { api } from '../api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await api.login(username, password);
      onLogin(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="glass-card auth-card">
        <div className="auth-brand"><span className="flame-icon">⛽</span> Gas Agency Hisab</div>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in as admin or as a delivery partner</p>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin or partner username" autoFocus />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="primary-btn large" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="auth-hint">
          Demo admin: <code>admin</code> / <code>admin123</code>
          <br />
          Demo delivery partner: <code>suresh</code> / <code>partner123</code>
        </p>
      </div>
    </div>
  );
}
