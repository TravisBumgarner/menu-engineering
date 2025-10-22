import { useTranslation } from 'react-i18next'
import { STORAGE_KEY } from '../internationalization'
import { TranslationKeys } from '../internationalization/types'

const setStoredLanguage = (language: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch (error) {
    console.warn('Could not write to localStorage:', error)
  }
}

export const useAppTranslation = () => {
  const { t, i18n } = useTranslation()

  const translate = (key: TranslationKeys, options?: any): string => {
    return t(key, options) as string
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
