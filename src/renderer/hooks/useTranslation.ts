import { useTranslation } from 'react-i18next'
import { TranslationKeys } from '../internationalization'

export const useAppTranslation = () => {
  const { t, i18n } = useTranslation()

  const translate = (key: TranslationKeys, options?: any): string => {
    return t(key, options) as string
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const currentLanguage = i18n.language

  return {
    t: translate,
    changeLanguage,
    currentLanguage,
  }
}
