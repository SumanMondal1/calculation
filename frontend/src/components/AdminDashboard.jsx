import { useEffect, useState } from 'react';
import { api } from '../api';
import HisabReport from './HisabReport';

const NAV_ITEMS = [
  { key: 'partners', label: 'Delivery Partners', icon: '🧑‍✈️' },
  { key: 'agencies', label: 'Agencies', icon: '🏢' },
  { key: 'reports', label: 'Reports', icon: '📊' },
];

function PartnersSection({ session, partners, loadPartners, loadError }) {
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

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

  return (
    <>
      <div className="glass-card">
        <h2>Create delivery partner</h2>
        <p className="card-sub-hint">Give them this username/password - they log into the same app to submit their daily hisab.</p>
        <form className="stacked-form" onSubmit={handleCreate}>
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Username / mobile" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="primary-btn" type="submit" disabled={creating}>
            {creating ? 'Creating…' : '+ Create partner'}
          </button>
          {createError && <div className="auth-error">{createError}</div>}
        </form>
      </div>

      <div className="glass-card">
        <h2>All delivery partners</h2>
        <ul className="partner-list">
          {partners.map((partner) => (
            <li key={partner.id}>
              <div className="partner-pill static">
                {partner.name}
                <span>@{partner.username} · joined {new Date(partner.createdAt).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
          {partners.length === 0 && <li className="hint">No delivery partners yet — create one above.</li>}
        </ul>
        {loadError && <div className="auth-error">{loadError}</div>}
      </div>
    </>
  );
}

function AgenciesSection({ session, agencies, loadAgencies }) {
  const [form, setForm] = useState({ name: '', defaultRate: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await api.createAgency(session.token, { name: form.name, defaultRate: Number(form.defaultRate || 0) });
      setForm({ name: '', defaultRate: '' });
      loadAgencies();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="glass-card">
        <h2>Create agency</h2>
        <p className="card-sub-hint">
          A saved agency is a dealer your delivery partners regularly hand cylinders to, at an agreed rate. Once created
          here, every partner sees it as a pick in their "Deliveries &amp; Sales" form, with the rate filled in
          automatically — no retyping the name or rate each day.
        </p>
        <form className="stacked-form" onSubmit={handleCreate}>
          <input placeholder="Agency name (e.g. Shree Balaji Gas Agency)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="number" min="0" placeholder="Agreed rate per cylinder (e.g. 1100)" value={form.defaultRate} onChange={(e) => setForm({ ...form, defaultRate: e.target.value })} />
          <button className="primary-btn" type="submit" disabled={creating}>
            {creating ? 'Creating…' : '+ Create agency'}
          </button>
          {createError && <div className="auth-error">{createError}</div>}
        </form>
      </div>

      <div className="glass-card">
        <h2>All agencies</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Default rate / cylinder</th></tr></thead>
            <tbody>
              {agencies.map((agency) => (
                <tr key={agency.id}>
                  <td>{agency.name}</td>
                  <td>₹{agency.defaultRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {agencies.length === 0 && <p className="hint">No agencies yet — create one above.</p>}
      </div>
    </>
  );
}

function ReportsSection({ session, partners }) {
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState('');

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
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSubs(false));
  }, [selectedPartnerId, session.token]);

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

  return (
    <>
      <div className="glass-card">
        <h2>Select a delivery partner</h2>
        <div className="submission-chip-row">
          {partners.map((partner) => (
            <button
              type="button"
              key={partner.id}
              className={partner.id === selectedPartnerId ? 'chip active' : 'chip'}
              onClick={() => setSelectedPartnerId(partner.id)}
            >
              {partner.name}
            </button>
          ))}
          {partners.length === 0 && <p className="hint">No delivery partners yet.</p>}
        </div>
      </div>

      {error && <div className="glass-card auth-error">{error}</div>}

      {selectedPartner && (
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
      )}

      {selectedSubmission && <HisabReport submission={selectedSubmission} />}

      {!selectedPartner && <div className="glass-card empty-state">Select a delivery partner above to see their hisab submissions.</div>}
    </>
  );
}

export default function AdminDashboard({ session, onLogout }) {
  const [activeSection, setActiveSection] = useState('partners');
  const [partners, setPartners] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loadError, setLoadError] = useState('');

  const loadPartners = () => api.listPartners(session.token).then(setPartners).catch((err) => setLoadError(err.message));
  const loadAgencies = () => api.listAgencies(session.token).then(setAgencies).catch((err) => setLoadError(err.message));

  useEffect(() => {
    loadPartners();
    loadAgencies();
  }, [session.token]);

  return (
    <div className="hisab-app">
      <header className="glass-card hisab-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage delivery partners, agencies, and review daily hisab</p>
        </div>
        <button className="ghost-btn" onClick={onLogout}>Logout</button>
      </header>

      <div className="admin-layout">
        <nav className="glass-card admin-nav">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.key}
              className={activeSection === item.key ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection(item.key)}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <main className="admin-main">
          {activeSection === 'partners' && (
            <PartnersSection session={session} partners={partners} loadPartners={loadPartners} loadError={loadError} />
          )}
          {activeSection === 'agencies' && (
            <AgenciesSection session={session} agencies={agencies} loadAgencies={loadAgencies} />
          )}
          {activeSection === 'reports' && <ReportsSection session={session} partners={partners} />}
        </main>
      </div>
    </div>
  );
}
