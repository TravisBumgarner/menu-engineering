import { type AllUnits, GENERIC_UNIT, VOLUME_UNIT, type VolumeUnit, WEIGHT_UNIT, type WeightUnit } from './units.types'

// Volume conversion factors (to milliliters)
export const VOLUME_TO_ML = {
  [VOLUME_UNIT.milliliters]: 1,
  [VOLUME_UNIT.liters]: 1000,
  [VOLUME_UNIT.cups]: 236.588, // US cup
  [VOLUME_UNIT.gallons]: 3785.41, // US gallon
} as const

// Weight conversion factors (to grams)
export const WEIGHT_TO_GRAMS = {
  [WEIGHT_UNIT.milligrams]: 0.001,
  [WEIGHT_UNIT.grams]: 1,
  [WEIGHT_UNIT.kilograms]: 1000,
  [WEIGHT_UNIT.ounces]: 28.3495,
  [WEIGHT_UNIT.pounds]: 453.592,
} as const

/**
 * Check if a unit is a volume unit
 */
export const isVolumeUnit = (unit: AllUnits): unit is VolumeUnit => {
  return Object.keys(VOLUME_UNIT).includes(unit)
}

/**
 * Check if a unit is a weight unit
 */
export const isWeightUnit = (unit: AllUnits): unit is WeightUnit => {
  return Object.keys(WEIGHT_UNIT).includes(unit)
}

/**
 * Check if a unit is a generic unit
 */
export const isGenericUnit = (unit: AllUnits): boolean => {
  return Object.keys(GENERIC_UNIT).includes(unit)
}

/**
 * Check if two units are compatible (in the same category and can be converted)
 * - Volume units are compatible with other volume units
 * - Weight units are compatible with other weight units
 * - Generic units are only compatible with themselves
 *
 * @param from - Source unit
 * @param to - Target unit
 * @returns true if units are compatible, false otherwise
 */
export const areUnitsCompatible = (from: AllUnits, to: AllUnits): boolean => {
  // Same unit is always compatible
  if (from === to) {
    return true
  }

  const isFromVolume = isVolumeUnit(from)
  const isToVolume = isVolumeUnit(to)
  const isFromWeight = isWeightUnit(from)
  const isToWeight = isWeightUnit(to)

  // Volume to volume or weight to weight
  return (isFromVolume && isToVolume) || (isFromWeight && isToWeight)
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
  from: AllUnits
  to: AllUnits
  value: number
}): number | null => {
  // Same unit, no conversion needed
  if (from === to) {
    return value
  }

  // Check if both units are volume units
  const isVolumeConversion = isVolumeUnit(from) && isVolumeUnit(to)

  // Check if both units are weight units
  const isWeightConversion = isWeightUnit(from) && isWeightUnit(to)

  // Cannot convert between different unit types (volume to weight or vice versa)
  // Also cannot convert to/from generic units
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
