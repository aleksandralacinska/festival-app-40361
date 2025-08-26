import React from 'react';
import { useTranslation } from 'react-i18next';
export default function HomePage(){
  const { t } = useTranslation();
  return (
    <>
      <h1 style={{color:'var(--primary)'}}>{t('welcome')}</h1>
      <div className="card">
        <p>Najbliższe wydarzenia, skróty i ważne komunikaty.</p>
      </div>
    </>
  );
}
