import { useState } from 'react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import { translateError } from '../i18n/translations';
import LanguageSwitcher from './LanguageSwitcher';

export default function LoginScreen({ onLogin }) {
  const { t } = useLanguage();
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
      setError(translateError(err.message, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="glass-card auth-card">
        <div className="auth-card-top">
          <div className="auth-brand"><span className="flame-icon">⛽</span> {t('brandName')}</div>
          <LanguageSwitcher />
        </div>
        <h1>{t('welcomeBack')}</h1>
        <p className="auth-sub">{t('loginSubtitle')}</p>

        <form onSubmit={handleSubmit}>
          <label>
            {t('username')}
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('usernamePlaceholder')} autoFocus />
          </label>
          <label>
            {t('password')}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="primary-btn large" type="submit" disabled={loading}>
            {loading ? t('signingIn') : t('login')}
          </button>
        </form>

        <p className="auth-hint">
          {t('demoAdminLabel')} <code>admin</code> / <code>admin123</code>
        </p>
      </div>
    </div>
  );
}
