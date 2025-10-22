// i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import EnglishTranslations from './english'
import SpanishTranslations from './spanish'

export const STORAGE_KEY = 'menu-engineering-language'

const getLanguageFromLocale = (): string => {
  try {
    const locale = navigator.language || navigator.languages?.[0] || 'en'

    // Spanish-speaking countries
    const spanishLocales = [
      'es',
      'es-ES',
      'es-MX',
      'es-AR',
      'es-CO',
      'es-PE',
      'es-VE',
      'es-CL',
      'es-EC',
      'es-GT',
      'es-CU',
      'es-BO',
      'es-DO',
      'es-HN',
      'es-PY',
      'es-SV',
      'es-NI',
      'es-CR',
      'es-PA',
      'es-UY',
      'es-PR',
      'es-GQ',
    ]

    if (spanishLocales.some(loc => locale.startsWith(loc.split('-')[0]))) {
      return 'es'
    }

    return 'en'
  } catch (error) {
    console.warn('Could not detect locale, defaulting to English:', error)
    return 'en'
  }
}

const getStoredLanguage = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Could not read from localStorage:', error)
    return null
  }
}

const getInitialLanguage = (): string => {
  const storedLanguage = getStoredLanguage()
  const detectedLanguage = getLanguageFromLocale()
  return storedLanguage || detectedLanguage || 'en'
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
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
