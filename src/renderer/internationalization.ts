// i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: 'Welcome',
        goodbye: 'Goodbye',
      },
    },
    es: {
      translation: {
        welcome: 'Bienvenido',
        goodbye: 'Adiós',
      },
    },
  },
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
