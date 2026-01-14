import { t } from 'i18next'
import { VOLUME_UNIT, type VolumeUnit, WEIGHT_UNIT, type WeightUnit } from '../shared/units.types'
import type { TranslationKeys } from './internationalization/types'

// Volume conversion factors (to milliliters)
const VOLUME_TO_ML = {
  [VOLUME_UNIT.milliliters]: 1,
  [VOLUME_UNIT.liters]: 1000,
  [VOLUME_UNIT.cups]: 236.588, // US cup
  // [VOLUME_UNIT.gallons]: 3785.41, // US gallon
} as const

// Weight conversion factors (to grams)
const WEIGHT_TO_GRAMS = {
  [WEIGHT_UNIT.milligrams]: 0.001,
  [WEIGHT_UNIT.grams]: 1,
  [WEIGHT_UNIT.kilograms]: 1000,
  // [WEIGHT_UNIT.ounces]: 28.3495,
  // [WEIGHT_UNIT.pounds]: 453.592,
} as const

export const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString)
  const country = getFromLocalStorage<string>('country', 'US')

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

/**
 * Convert between different units of measurement
 * @param params - Conversion parameters
 * @param params.from - Source unit
 * @param params.to - Target unit
 * @param params.value - Value to convert
 * @returns Converted value or null if conversion is not possible
 */
export const convertUnits = ({
  from,
  to,
  value,
}: {
  from: VolumeUnit | WeightUnit
  to: VolumeUnit | WeightUnit
  value: number
}): number | null => {
  // Check if both units are volume units
  const isVolumeConversion =
    Object.values(VOLUME_UNIT).includes(from as VolumeUnit) && Object.values(VOLUME_UNIT).includes(to as VolumeUnit)

  // Check if both units are weight units
  const isWeightConversion =
    Object.values(WEIGHT_UNIT).includes(from as WeightUnit) && Object.values(WEIGHT_UNIT).includes(to as WeightUnit)

  // Cannot convert between different unit types (volume to weight or vice versa)
  if (!isVolumeConversion && !isWeightConversion) {
    return null
  }

  if (isVolumeConversion) {
    const fromML = VOLUME_TO_ML[from as VolumeUnit]
    const toML = VOLUME_TO_ML[to as VolumeUnit]
    return (value * fromML) / toML
  }

  if (isWeightConversion) {
    const fromGrams = WEIGHT_TO_GRAMS[from as WeightUnit]
    const toGrams = WEIGHT_TO_GRAMS[to as WeightUnit]
    return (value * fromGrams) / toGrams
  }

  return null
}

export const formatCurrency = (amount: number) => {
  const country = getFromLocalStorage<string>('country', 'US')

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
 * Get a value from localStorage with type safety and fallback support
 * @param key - The localStorage key
 * @param fallback - The fallback value if key doesn't exist or parsing fails
 * @returns The parsed value or fallback
 */
export const getFromLocalStorage = <T>(key: string, fallback: T): T => {
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
export const setToLocalStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to set localStorage item "${key}":`, error)
  }
}
