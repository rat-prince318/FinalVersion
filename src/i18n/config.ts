import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './resources/en';
import zh from './resources/zh';

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'querystring', 'cookie'],
      caches: ['localStorage']
    }
  });

export default i18n;