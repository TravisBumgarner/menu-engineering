import { t } from 'i18next'
import { type AllUnits, GENERIC_UNIT, type UnitPreferences } from '../shared/units.types'
import type { TranslationKeys } from './internationalization/types'

// Re-export convertUnits from shared module for renderer usage
export { convertUnits } from '../shared/unitConversion'

export const LOCAL_STORAGE_KEYS = {
  UNIT_PREFERENCES_KEY: 'UNIT_PREFERENCES_KEY',
  COUNTRY: 'COUNTRY',
  BROWSE_INGREDIENTS_PAGINATION: 'BROWSE_INGREDIENTS_PAGINATION',
  BROWSE_RECIPES_PAGINATION: 'BROWSE_RECIPES_PAGINATION',
  RECIPE_DETAILS_PAGINATION: 'RECIPE_DETAILS_PAGINATION',
  CHANGELOG_LAST_SEEN_VERSION: 'CHANGELOG_LAST_SEEN_VERSION',
} as const

export const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString)
  const country = getFromLocalStorage<string>(LOCAL_STORAGE_KEYS.COUNTRY, 'US')

  const localeMap: Record<string, string> = {
    US: 'en-US',
    MX: 'es-MX',
  }

  const locale = localeMap[country] || 'en-US'

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

export const formatCurrency = (amount: number) => {
  const country = getFromLocalStorage<string>(LOCAL_STORAGE_KEYS.COUNTRY, 'US')

  const localeMap: Record<string, string> = {
    US: 'en-US',
    MX: 'es-MX',
  }

  const currencyMap: Record<string, string> = {
    US: 'USD',
    MX: 'MXN',
  }

  const locale = localeMap[country] || 'en-US'
  const currency = currencyMap[country] || 'USD'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const formateDateFilename = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}_${month}_${day}`
}

export const getUnitLabel = (unit: string, quantity: number | 'singular' | 'plural') => {
  let suffix: string
  if (quantity === 'singular') {
    suffix = '_singular'
  } else if (quantity === 'plural') {
    suffix = '_plural'
  } else {
    suffix = quantity === 1 ? '_singular' : '_plural'
  }
  return t(`${unit}${suffix}` as TranslationKeys)
}

/**
 * Get the first enabled unit from user preferences
 * @param unitPreferences - The user's unit preferences
 * @returns The first enabled unit
 */
export const getFirstEnabledUnit = (unitPreferences: UnitPreferences): AllUnits => {
  // Return first enabled unit in order: generic, volume, weight
  if (unitPreferences.generic.length > 0) {
    return unitPreferences.generic[0] as AllUnits
  }
  if (unitPreferences.volume.length > 0) {
    return unitPreferences.volume[0] as AllUnits
  }
  if (unitPreferences.weight.length > 0) {
    return unitPreferences.weight[0] as AllUnits
  }
  // Fallback (should never happen as settings prevent deselecting all)
  return GENERIC_UNIT.units
}

/**
 * Get a value from localStorage with type safety and fallback support
 * @param key - The localStorage key
 * @param fallback - The fallback value if key doesn't exist or parsing fails
 * @returns The parsed value or fallback
 */
export const getFromLocalStorage = <T>(key: keyof typeof LOCAL_STORAGE_KEYS, fallback: T): T => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return fallback
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error)
    return fallback
  }
}

/**
 * Set a value in localStorage with JSON serialization
 * @param key - The localStorage key
 * @param value - The value to store
 */
export const setToLocalStorage = <T>(key: keyof typeof LOCAL_STORAGE_KEYS, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to set localStorage item "${key}":`, error)
  }
}
