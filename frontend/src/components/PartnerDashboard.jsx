import { useEffect, useState } from 'react';
import { api } from '../api';
import HisabEditor from './HisabEditor';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';
import { translateError } from '../i18n/translations';

export default function PartnerDashboard({ session, onLogout }) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedDate, setLastSavedDate] = useState(null);
  const [error, setError] = useState('');
  const [mySubmissions, setMySubmissions] = useState([]);

  const loadMine = () => {
    api.mySubmissions(session.token).then(setMySubmissions).catch(() => {});
  };

  useEffect(loadMine, [session.token]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      const record = await api.submitHisab(session.token, payload);
      setLastSavedDate(record.date);
      loadMine();
    } catch (err) {
      setError(translateError(err.message, t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hisab-app">
      <header className="glass-card hisab-header">
        <div>
          <h1>{t('dailyHisab')}</h1>
          <p>{t('welcomeName', { name: session.partner?.name })}</p>
        </div>
        <div className="header-actions">
          <LanguageSwitcher />
          <button className="ghost-btn" onClick={onLogout}>{t('logout')}</button>
        </div>
      </header>

      {error && <div className="glass-card auth-error">{error}</div>}

      <HisabEditor token={session.token} onSubmit={handleSubmit} submitting={submitting} lastSavedDate={lastSavedDate} />

      {mySubmissions.length > 0 && (
        <div className="glass-card history-card">
          <h2>{t('myPastSubmissions')}</h2>
          <div className="submission-chip-row">
            {mySubmissions.map((sub) => (
              <span key={sub.id} className={`chip static ${sub.status}`}>
                {sub.date}
                <span className={`dot ${sub.status}`} />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
