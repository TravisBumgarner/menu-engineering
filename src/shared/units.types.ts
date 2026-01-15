export const VOLUME_UNIT = {
  cups: 'cups',
  gallons: 'gallons',
  liters: 'liters',
  milliliters: 'milliliters',
} as const
export type VolumeUnit = keyof typeof VOLUME_UNIT

export const WEIGHT_UNIT = {
  grams: 'grams',
  kilograms: 'kilograms',
  milligrams: 'milligrams',
  ounces: 'ounces',
  pounds: 'pounds',
} as const
export type WeightUnit = keyof typeof WEIGHT_UNIT

export const GENERIC_UNIT = {
  units: 'units',
} as const

export type GenericUnit = keyof typeof GENERIC_UNIT

export const ALL_UNITS = {
  ...VOLUME_UNIT,
  ...WEIGHT_UNIT,
  ...GENERIC_UNIT,
} as const
export type AllUnits = keyof typeof ALL_UNITS
