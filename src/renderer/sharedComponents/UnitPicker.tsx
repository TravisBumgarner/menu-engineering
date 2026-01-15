import { Button, FormControl, Popover, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useState } from 'react'
import { type AllUnits, GENERIC_UNIT, type UnitPreferences, VOLUME_UNIT, WEIGHT_UNIT } from '../../shared/units.types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAppTranslation } from '../hooks/useTranslation'
import { SPACING } from '../styles/consts'
import { LOCAL_STORAGE_KEYS } from '../utilities'
import { DEFAULT_UNIT_PREFERENCES } from './Modal/components/SettingsModal/components/TabUnitPreferences'

interface UnitSelectProps {
  value: AllUnits
  onChange: (value: AllUnits) => void
  required?: boolean
  fullWidth?: boolean
  disabled?: boolean
}

const UnitSelect = ({ value, onChange, required = false, fullWidth = false, disabled = false }: UnitSelectProps) => {
  const { t } = useAppTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [unitPreferences] = useLocalStorage<UnitPreferences>(
    LOCAL_STORAGE_KEYS.UNIT_PREFERENCES_KEY,
    DEFAULT_UNIT_PREFERENCES,
  )

  const open = Boolean(anchorEl)

  const handleSelect = (v: AllUnits) => {
    onChange(v)
    setAnchorEl(null)
  }

  // Filter units based on preferences
  const enabledGenericUnits = Object.keys(GENERIC_UNIT).filter((unit) => unitPreferences.generic.includes(unit))
  const enabledWeightUnits = Object.keys(WEIGHT_UNIT).filter((unit) => unitPreferences.weight.includes(unit))
  const enabledVolumeUnits = Object.keys(VOLUME_UNIT).filter((unit) => unitPreferences.volume.includes(unit))

  return (
    <FormControl size="small" fullWidth={fullWidth} required={required}>
      <Button disabled={disabled} variant="outlined" size="medium" onClick={(e) => setAnchorEl(e.currentTarget)}>
        {t(`${value}_abbreviated`)}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Stack spacing={SPACING.TINY.PX} direction="column" padding={SPACING.TINY.PX} sx={{ minWidth: '200px' }}>
          {enabledGenericUnits.length > 0 && (
            <ToggleButtonGroup
              color="primary"
              fullWidth
              value={value}
              exclusive
              onChange={(_, v) => v && handleSelect(v)}
              size="small"
            >
              {enabledGenericUnits.map((unit) => (
                <ToggleButton key={unit} fullWidth value={unit}>
                  {t(`${unit as AllUnits}_abbreviated`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          {enabledWeightUnits.length > 0 && (
            <ToggleButtonGroup
              color="primary"
              fullWidth
              value={value}
              exclusive
              onChange={(_, v) => v && handleSelect(v)}
              size="small"
            >
              {enabledWeightUnits.map((unit) => (
                <ToggleButton key={unit} fullWidth value={unit}>
                  {t(`${unit as AllUnits}_abbreviated`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          {enabledVolumeUnits.length > 0 && (
            <ToggleButtonGroup
              color="primary"
              fullWidth
              value={value}
              exclusive
              onChange={(_, v) => v && handleSelect(v)}
              size="small"
            >
              {enabledVolumeUnits.map((unit) => (
                <ToggleButton key={unit} fullWidth value={unit}>
                  {t(`${unit as AllUnits}_abbreviated`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </Stack>
        <Typography variant="caption" sx={{ maxWidth: '200px', display: 'block', p: SPACING.TINY.PX }}>
          {t('modifyUnitsInPreferences')}
        </Typography>
      </Popover>
    </FormControl>
  )
}

export default UnitSelect
