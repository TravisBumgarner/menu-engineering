import { useTranslation } from 'react-i18next'
import { STORAGE_KEY } from '../internationalization'
import { TranslationKeys } from '../internationalization/types'

// Import all translation keys from the type
import englishTranslations from '../internationalization/english'

const setStoredLanguage = (language: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch (error) {
    console.warn('Could not write to localStorage:', error)
  }
}

// Translation key usage tracker
const TRACK_TRANSLATION_KEYS = true

const usedKeys = new Set<TranslationKeys>()
const allKeys = Object.keys(englishTranslations) as TranslationKeys[]

const trackKeyUsage = (key: TranslationKeys) => {
  if (!TRACK_TRANSLATION_KEYS) return

  if (!usedKeys.has(key)) {
    usedKeys.add(key)
    const unusedKeys = allKeys.filter(k => !usedKeys.has(k))
    console.log('UNUSED KEYS:', unusedKeys)
  }
}

export const useAppTranslation = () => {
  const { t, i18n } = useTranslation()

  const translate = (key: TranslationKeys) => {
    trackKeyUsage(key)
    return t(key)
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setStoredLanguage(lng)
  }

  const currentLanguage = i18n.language

  return {
    t: translate,
    changeLanguage,
    currentLanguage,
  }
}
