import { useEffect, useState } from 'react';
import { api } from '../api';
import HisabReport from './HisabReport';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';
import { translateError } from '../i18n/translations';

function PartnersSection({ session, partners, loadPartners, loadError }) {
  const { t } = useLanguage();
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
      setCreateError(translateError(err.message, t));
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="glass-card">
        <h2>{t('createPartnerTitle')}</h2>
        <p className="card-sub-hint">{t('createPartnerHint')}</p>
        <form className="stacked-form" onSubmit={handleCreate}>
          <input placeholder={t('fullNamePlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder={t('usernameMobilePlaceholder')} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input type="password" placeholder={t('passwordPlaceholder')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="primary-btn" type="submit" disabled={creating}>
            {creating ? t('creating') : t('createPartnerBtn')}
          </button>
          {createError && <div className="auth-error">{createError}</div>}
        </form>
      </div>

      <div className="glass-card">
        <h2>{t('allPartnersTitle')}</h2>
        <ul className="partner-list">
          {partners.map((partner) => (
            <li key={partner.id}>
              <div className="partner-pill static">
                {partner.name}
                <span>@{partner.username} · {t('joined', { date: new Date(partner.createdAt).toLocaleDateString() })}</span>
              </div>
            </li>
          ))}
          {partners.length === 0 && <li className="hint">{t('noPartnersYet')}</li>}
        </ul>
        {loadError && <div className="auth-error">{loadError}</div>}
      </div>
    </>
  );
}

function AgenciesSection({ session, agencies, loadAgencies }) {
  const { t } = useLanguage();
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
      setCreateError(translateError(err.message, t));
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="glass-card">
        <h2>{t('createAgencyTitle')}</h2>
        <p className="card-sub-hint">{t('createAgencyHint')}</p>
        <form className="stacked-form" onSubmit={handleCreate}>
          <input placeholder={t('agencyNameFormPlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="number" min="0" placeholder={t('agencyRatePlaceholder')} value={form.defaultRate} onChange={(e) => setForm({ ...form, defaultRate: e.target.value })} />
          <button className="primary-btn" type="submit" disabled={creating}>
            {creating ? t('creating') : t('createAgencyBtn')}
          </button>
          {createError && <div className="auth-error">{createError}</div>}
        </form>
      </div>

      <div className="glass-card">
        <h2>{t('allAgenciesTitle')}</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>{t('agencyNameCol')}</th><th>{t('agencyRateCol')}</th></tr></thead>
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
        {agencies.length === 0 && <p className="hint">{t('noAgenciesYet')}</p>}
      </div>
    </>
  );
}

function ReportsSection({ session, partners }) {
  const { t } = useLanguage();
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
      .catch((err) => setError(translateError(err.message, t)))
      .finally(() => setLoadingSubs(false));
  }, [selectedPartnerId, session.token]);

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

  return (
    <>
      <div className="glass-card">
        <h2>{t('selectPartnerTitle')}</h2>
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
          {partners.length === 0 && <p className="hint">{t('noPartnersShort')}</p>}
        </div>
      </div>

      {error && <div className="glass-card auth-error">{error}</div>}

      {selectedPartner && (
        <div className="glass-card">
          <h2>{t('partnerSubmissionsTitle', { name: selectedPartner.name })}</h2>
          {loadingSubs && <p className="hint">{t('loading')}</p>}
          {!loadingSubs && submissions.length === 0 && <p className="hint">{t('noHisabYet')}</p>}
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

      {!selectedPartner && <div className="glass-card empty-state">{t('selectPartnerPrompt')}</div>}
    </>
  );
}

export default function AdminDashboard({ session, onLogout }) {
  const { t } = useLanguage();
  const NAV_ITEMS = [
    { key: 'partners', label: t('navPartners'), icon: '🧑‍✈️' },
    { key: 'agencies', label: t('navAgencies'), icon: '🏢' },
    { key: 'reports', label: t('navReports'), icon: '📊' },
  ];

  const [activeSection, setActiveSection] = useState('partners');
  const [partners, setPartners] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loadError, setLoadError] = useState('');

  const loadPartners = () => api.listPartners(session.token).then(setPartners).catch((err) => setLoadError(translateError(err.message, t)));
  const loadAgencies = () => api.listAgencies(session.token).then(setAgencies).catch((err) => setLoadError(translateError(err.message, t)));

  useEffect(() => {
    loadPartners();
    loadAgencies();
  }, [session.token]);

  return (
    <div className="hisab-app">
      <header className="glass-card hisab-header">
        <div>
          <h1>{t('adminDashboard')}</h1>
          <p>{t('adminSubtitle')}</p>
        </div>
        <div className="header-actions">
          <LanguageSwitcher />
          <button className="ghost-btn" onClick={onLogout}>{t('logout')}</button>
        </div>
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
