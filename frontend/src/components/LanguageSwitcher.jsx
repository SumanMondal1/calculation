import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      <button
        type="button"
        className={language === 'en' ? 'lang-btn active' : 'lang-btn'}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={language === 'bn' ? 'lang-btn active' : 'lang-btn'}
        onClick={() => setLanguage('bn')}
      >
        বাং
      </button>
    </div>
  );
}
