import { useEffect, useState } from 'react';
import { api } from './api';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import PartnerDashboard from './components/PartnerDashboard';

function loadSession() {
  try {
    const raw = localStorage.getItem('hisab-session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem('hisab-session', JSON.stringify(session));
      } else {
        localStorage.removeItem('hisab-session');
      }
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, [session]);

  const handleLogout = () => {
    if (session?.token) {
      api.logout(session.token).catch(() => {});
    }
    setSession(null);
  };

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }

  if (session.role === 'admin') {
    return <AdminDashboard session={session} onLogout={handleLogout} />;
  }

  return <PartnerDashboard session={session} onLogout={handleLogout} />;
}
