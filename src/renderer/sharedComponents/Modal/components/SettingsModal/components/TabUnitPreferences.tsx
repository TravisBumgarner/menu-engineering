import { Box, Checkbox, Divider, FormControlLabel, FormGroup, Stack, Typography } from '@mui/material'
import { type AllUnits, GENERIC_UNIT, VOLUME_UNIT, WEIGHT_UNIT } from '../../../../../../shared/units.types'
import { useLocalStorage } from '../../../../../hooks/useLocalStorage'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import { SPACING } from '../../../../../styles/consts'
import UnitConversions from './UnitConversions'

export interface UnitPreferences {
  volume: string[]
  weight: string[]
  generic: string[]
}

export const DEFAULT_UNIT_PREFERENCES: UnitPreferences = {
  volume: Object.keys(VOLUME_UNIT),
  weight: Object.keys(WEIGHT_UNIT),
  generic: Object.keys(GENERIC_UNIT),
}

export const UNIT_PREFERENCES_KEY = 'unitPreferences'

const TabUnitPreferences = () => {
  const { t } = useAppTranslation()
  const [unitPreferences, setUnitPreferences] = useLocalStorage<UnitPreferences>(
    UNIT_PREFERENCES_KEY,
    DEFAULT_UNIT_PREFERENCES,
  )

  const handleToggleUnit = (category: keyof UnitPreferences, unit: string) => {
    setUnitPreferences((prev) => {
      const currentUnits = prev[category]
      const isSelected = currentUnits.includes(unit)

      // Don't allow deselecting all units in a category
      if (isSelected && currentUnits.length === 1) {
        return prev
      }

      return {
        ...prev,
        [category]: isSelected ? currentUnits.filter((u) => u !== unit) : [...currentUnits, unit],
      }
    })
  }

  return (
    <Box sx={{ mt: SPACING.MEDIUM.PX }}>
      <Stack direction="row" spacing={SPACING.SMALL.PX}>
        <Stack sx={{ flexShrink: 0, width: '140px' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('volumeUnits')}
          </Typography>
          <FormGroup sx={{ gap: 0 }}>
            {Object.keys(VOLUME_UNIT).map((unit) => (
              <FormControlLabel
                key={unit}
                sx={{ m: '0 0 0 -5px', height: 24 }}
                control={
                  <Checkbox
                    size="small"
                    checked={unitPreferences.volume.includes(unit)}
                    onChange={() => handleToggleUnit('volume', unit)}
                    sx={{ py: 0 }}
                  />
                }
                label={
                  <Typography variant="caption">
                    {t(`${unit as AllUnits}_plural`)} ({t(`${unit as AllUnits}_abbreviated`)})
                  </Typography>
                }
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 1 }} />

          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('weightUnits')}
          </Typography>
          <FormGroup sx={{ gap: 0 }}>
            {Object.keys(WEIGHT_UNIT).map((unit) => (
              <FormControlLabel
                key={unit}
                sx={{ m: '0 0 0 -5px', height: 24 }}
                control={
                  <Checkbox
                    size="small"
                    checked={unitPreferences.weight.includes(unit)}
                    onChange={() => handleToggleUnit('weight', unit)}
                    sx={{ py: 0 }}
                  />
                }
                label={
                  <Typography variant="caption">
                    {' '}
                    {t(`${unit as AllUnits}_plural`)} ({t(`${unit as AllUnits}_abbreviated`)})
                  </Typography>
                }
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 1 }} />

          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('genericUnits')}
          </Typography>
          <FormGroup sx={{ gap: 0 }}>
            {Object.keys(GENERIC_UNIT).map((unit) => (
              <FormControlLabel
                key={unit}
                sx={{ m: '0 0 0 -5px', height: 24 }}
                control={
                  <Checkbox
                    size="small"
                    checked={unitPreferences.generic.includes(unit)}
                    onChange={() => handleToggleUnit('generic', unit)}
                    sx={{ py: 0 }}
                  />
                }
                label={
                  <Typography variant="caption">
                    {' '}
                    {t(`${unit as AllUnits}_plural`)} ({t(`${unit as AllUnits}_abbreviated`)})
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Stack>
        <UnitConversions unitPreferences={unitPreferences} />
      </Stack>
    </Box>
  )
}

export default TabUnitPreferences
