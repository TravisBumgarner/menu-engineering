// i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

type TranslationKeys = 'welcome' | 'goodbye'

const EnglishTranslations: Record<TranslationKeys, string> = {
  welcome: 'Welcome',
  goodbye: 'Goodbye',
}

const SpanishTranslations: Record<TranslationKeys, string> = {
  welcome: 'Bienvenido',
  goodbye: 'Adiós',
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: EnglishTranslations,
    },
    es: {
      translation: SpanishTranslations,
    },
  },
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
