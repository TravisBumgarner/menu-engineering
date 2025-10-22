export const VOLUME_UNIT = {
  LITERS: 'LITERS',
  MILLILITERS: 'MILLILITERS',
  GALLONS: 'GALLONS',
  CUPS: 'CUPS',
} as const
export type VolumeUnit = keyof typeof VOLUME_UNIT

export const WEIGHT_UNIT = {
  GRAMS: 'GRAMS',
  KILOGRAMS: 'KILOGRAMS',
  OUNCES: 'OUNCES',
  POUNDS: 'POUNDS',
} as const
export type WeightUnit = keyof typeof WEIGHT_UNIT

export const GENERIC_UNIT = {
  PIECES: 'PIECES',
}
export type GenericUnit = keyof typeof GENERIC_UNIT

export const ALL_UNITS = {
  ...VOLUME_UNIT,
  ...WEIGHT_UNIT,
  ...GENERIC_UNIT,
}
