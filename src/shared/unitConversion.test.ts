import { describe, expect, it } from 'vitest'
import { areUnitsCompatible, convertUnits, isGenericUnit, isVolumeUnit, isWeightUnit } from './unitConversion'

describe('isVolumeUnit', () => {
  it('returns true for volume units', () => {
    expect(isVolumeUnit('cups')).toBe(true)
    expect(isVolumeUnit('liters')).toBe(true)
    expect(isVolumeUnit('milliliters')).toBe(true)
    expect(isVolumeUnit('gallons')).toBe(true)
  })

  it('returns false for weight units', () => {
    expect(isVolumeUnit('grams')).toBe(false)
    expect(isVolumeUnit('kilograms')).toBe(false)
  })

  it('returns false for generic units', () => {
    expect(isVolumeUnit('units')).toBe(false)
  })
})

describe('isWeightUnit', () => {
  it('returns true for weight units', () => {
    expect(isWeightUnit('grams')).toBe(true)
    expect(isWeightUnit('kilograms')).toBe(true)
    expect(isWeightUnit('milligrams')).toBe(true)
    expect(isWeightUnit('ounces')).toBe(true)
    expect(isWeightUnit('pounds')).toBe(true)
  })

  it('returns false for volume units', () => {
    expect(isWeightUnit('cups')).toBe(false)
    expect(isWeightUnit('liters')).toBe(false)
  })

  it('returns false for generic units', () => {
    expect(isWeightUnit('units')).toBe(false)
  })
})

describe('isGenericUnit', () => {
  it('returns true for generic units', () => {
    expect(isGenericUnit('units')).toBe(true)
  })

  it('returns false for volume units', () => {
    expect(isGenericUnit('cups')).toBe(false)
  })

  it('returns false for weight units', () => {
    expect(isGenericUnit('grams')).toBe(false)
  })
})

describe('areUnitsCompatible', () => {
  describe('volume units', () => {
    it('returns true for volume to volume conversions', () => {
      expect(areUnitsCompatible('cups', 'liters')).toBe(true)
      expect(areUnitsCompatible('milliliters', 'gallons')).toBe(true)
      expect(areUnitsCompatible('liters', 'cups')).toBe(true)
    })
  })

  describe('weight units', () => {
    it('returns true for weight to weight conversions', () => {
      expect(areUnitsCompatible('grams', 'kilograms')).toBe(true)
      expect(areUnitsCompatible('ounces', 'pounds')).toBe(true)
      expect(areUnitsCompatible('milligrams', 'grams')).toBe(true)
    })
  })

  describe('same unit', () => {
    it('returns true when from and to are the same', () => {
      expect(areUnitsCompatible('cups', 'cups')).toBe(true)
      expect(areUnitsCompatible('grams', 'grams')).toBe(true)
      expect(areUnitsCompatible('units', 'units')).toBe(true)
    })
  })

  describe('incompatible units', () => {
    it('returns false for volume to weight conversions', () => {
      expect(areUnitsCompatible('cups', 'grams')).toBe(false)
      expect(areUnitsCompatible('liters', 'kilograms')).toBe(false)
    })

    it('returns false for weight to volume conversions', () => {
      expect(areUnitsCompatible('grams', 'cups')).toBe(false)
      expect(areUnitsCompatible('pounds', 'liters')).toBe(false)
    })

    it('returns false for generic to volume conversions', () => {
      expect(areUnitsCompatible('units', 'cups')).toBe(false)
      expect(areUnitsCompatible('cups', 'units')).toBe(false)
    })

    it('returns false for generic to weight conversions', () => {
      expect(areUnitsCompatible('units', 'grams')).toBe(false)
      expect(areUnitsCompatible('grams', 'units')).toBe(false)
    })
  })
})

describe('convertUnits', () => {
  describe('same unit', () => {
    it('returns the same value when from and to are the same', () => {
      expect(convertUnits({ from: 'cups', to: 'cups', value: 5 })).toBe(5)
      expect(convertUnits({ from: 'grams', to: 'grams', value: 100 })).toBe(100)
      expect(convertUnits({ from: 'units', to: 'units', value: 10 })).toBe(10)
    })
  })

  describe('volume conversions', () => {
    it('converts cups to liters', () => {
      // 1 cup = 236.588 ml, 1 liter = 1000 ml
      // 1 cup = 0.236588 liters
      const result = convertUnits({ from: 'cups', to: 'liters', value: 1 })
      expect(result).toBeCloseTo(0.236588, 4)
    })

    it('converts liters to cups', () => {
      // 1 liter = 1000 ml, 1 cup = 236.588 ml
      // 1 liter = 4.2268 cups
      const result = convertUnits({ from: 'liters', to: 'cups', value: 1 })
      expect(result).toBeCloseTo(4.2268, 3)
    })

    it('converts milliliters to liters', () => {
      const result = convertUnits({ from: 'milliliters', to: 'liters', value: 1000 })
      expect(result).toBe(1)
    })

    it('converts gallons to liters', () => {
      // 1 gallon = 3785.41 ml = 3.78541 liters
      const result = convertUnits({ from: 'gallons', to: 'liters', value: 1 })
      expect(result).toBeCloseTo(3.78541, 4)
    })
  })

  describe('weight conversions', () => {
    it('converts grams to kilograms', () => {
      const result = convertUnits({ from: 'grams', to: 'kilograms', value: 1000 })
      expect(result).toBe(1)
    })

    it('converts kilograms to grams', () => {
      const result = convertUnits({ from: 'kilograms', to: 'grams', value: 1 })
      expect(result).toBe(1000)
    })

    it('converts ounces to grams', () => {
      // 1 ounce = 28.3495 grams
      const result = convertUnits({ from: 'ounces', to: 'grams', value: 1 })
      expect(result).toBeCloseTo(28.3495, 4)
    })

    it('converts pounds to kilograms', () => {
      // 1 pound = 453.592 grams = 0.453592 kg
      const result = convertUnits({ from: 'pounds', to: 'kilograms', value: 1 })
      expect(result).toBeCloseTo(0.453592, 4)
    })

    it('converts milligrams to grams', () => {
      const result = convertUnits({ from: 'milligrams', to: 'grams', value: 1000 })
      expect(result).toBe(1)
    })
  })

  describe('incompatible conversions', () => {
    it('returns null for volume to weight conversions', () => {
      expect(convertUnits({ from: 'cups', to: 'grams', value: 1 })).toBeNull()
      expect(convertUnits({ from: 'liters', to: 'kilograms', value: 1 })).toBeNull()
    })

    it('returns null for weight to volume conversions', () => {
      expect(convertUnits({ from: 'grams', to: 'cups', value: 1 })).toBeNull()
      expect(convertUnits({ from: 'pounds', to: 'liters', value: 1 })).toBeNull()
    })

    it('returns null for generic to volume conversions', () => {
      expect(convertUnits({ from: 'units', to: 'cups', value: 1 })).toBeNull()
    })

    it('returns null for generic to weight conversions', () => {
      expect(convertUnits({ from: 'units', to: 'grams', value: 1 })).toBeNull()
    })

    it('returns null for volume to generic conversions', () => {
      expect(convertUnits({ from: 'cups', to: 'units', value: 1 })).toBeNull()
    })

    it('returns null for weight to generic conversions', () => {
      expect(convertUnits({ from: 'grams', to: 'units', value: 1 })).toBeNull()
    })
  })
})
