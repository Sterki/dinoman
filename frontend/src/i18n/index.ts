import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import de from './locales/de.json'
import es from './locales/es.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      de: { translation: de },
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'de'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'diabetes_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
