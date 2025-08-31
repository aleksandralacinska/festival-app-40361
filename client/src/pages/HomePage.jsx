import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HomePage(){
  const { t } = useTranslation();
  const bgUrl = '/images/wallpaper.png';

  return (
    <>
      {/* hero + tło */}
      <section
        className="home-hero"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.45), rgba(0,0,0,.15)), url(${bgUrl})`,
        }}
        aria-label={t('welcome')}
      >
        <div className="home-hero__inner">
          <span className="badge">Festival APP</span>
          <h1 className="home-hero__title">{t('welcome')}</h1>
          <p className="home-hero__subtitle">
            {t('home_tagline', 'Dzień dobry!')}
          </p>
        </div>
      </section>

      {/* treści pod hero (karty, skróty, itp.) */}
      <div className="card" style={{ marginTop: 16 }}>
        <p>{t('home_card_intro')}</p>
      </div>
    </>
  );
}
