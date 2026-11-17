import { useEffect, useState } from 'react';
import { api } from '../api';
import HisabReport from './HisabReport';

export default function AdminDashboard({ session, onLogout }) {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadPartners = () => {
    api.listPartners(session.token).then(setPartners).catch((err) => setLoadError(err.message));
  };

  useEffect(loadPartners, [session.token]);

  useEffect(() => {
    if (!selectedPartnerId) {
      setSubmissions([]);
      setSelectedSubmission(null);
      return;
    }
    setLoadingSubs(true);
    api
      .partnerSubmissions(session.token, selectedPartnerId)
      .then((data) => {
        setSubmissions(data);
        setSelectedSubmission(data[0] || null);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoadingSubs(false));
  }, [selectedPartnerId, session.token]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await api.createPartner(session.token, form);
      setForm({ name: '', username: '', password: '' });
      loadPartners();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

  return (
    <div className="hisab-app">
      <header className="glass-card hisab-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Create delivery partners and review their daily hisab</p>
        </div>
        <button className="ghost-btn" onClick={onLogout}>Logout</button>
      </header>

      <div className="admin-layout">
        <aside className="glass-card admin-panel">
          <h2>Create delivery partner</h2>
          <form className="stacked-form" onSubmit={handleCreate}>
            <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Username / mobile" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <button className="primary-btn" type="submit" disabled={creating}>
              {creating ? 'Creating…' : '+ Create partner'}
            </button>
            {createError && <div className="auth-error">{createError}</div>}
          </form>

          <h2 className="mt">Delivery partners</h2>
          <ul className="partner-list">
            {partners.map((partner) => (
              <li key={partner.id}>
                <button
                  type="button"
                  className={partner.id === selectedPartnerId ? 'partner-pill active' : 'partner-pill'}
                  onClick={() => setSelectedPartnerId(partner.id)}
                >
                  {partner.name}
                  <span>@{partner.username}</span>
                </button>
              </li>
            ))}
            {partners.length === 0 && <li className="hint">No delivery partners yet — create one above.</li>}
          </ul>
          {loadError && <div className="auth-error">{loadError}</div>}
        </aside>

        <main className="admin-main">
          {!selectedPartner && (
            <div className="glass-card empty-state">Select a delivery partner to see their hisab submissions.</div>
          )}

          {selectedPartner && (
            <>
              <div className="glass-card">
                <h2>{selectedPartner.name}'s submissions</h2>
                {loadingSubs && <p className="hint">Loading…</p>}
                {!loadingSubs && submissions.length === 0 && <p className="hint">No hisab submitted yet.</p>}
                <div className="submission-chip-row">
                  {submissions.map((sub) => (
                    <button
                      type="button"
                      key={sub.id}
                      className={selectedSubmission?.id === sub.id ? 'chip active' : 'chip'}
                      onClick={() => setSelectedSubmission(sub)}
                    >
                      {sub.date}
                      <span className={`dot ${sub.status}`} />
                    </button>
                  ))}
                </div>
              </div>

              {selectedSubmission && <HisabReport submission={selectedSubmission} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
