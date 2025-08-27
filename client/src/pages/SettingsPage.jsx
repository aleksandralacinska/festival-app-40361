import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { i18n, t } = useTranslation();

  return (
    <>
      <h2>{t('settings')}</h2>

      <div className="card" style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <label htmlFor="lang-select" style={{ fontWeight: 700 }}>
          {t('language')}
        </label>

        <select
          id="lang-select"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ececec' }}
        >
          <option value="pl">{t('language_polish')}</option>
          <option value="en">{t('language_english')}</option>
        </select>
      </div>
    </>
  );
}
