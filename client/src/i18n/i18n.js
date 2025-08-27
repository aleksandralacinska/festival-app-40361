import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pl from './pl.json';
import en from './en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    lng: localStorage.getItem('lang') || 'pl',
    fallbackLng: 'pl',
    interpolation: { escapeValue: false },
  });

// zapamiętaj wybór użytkownika
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('lang', lng);
  } catch (e) {
    if (import.meta.env?.DEV) {
      console.debug('i18n: cannot persist lang', e);
    }
  }
});

export default i18n;
