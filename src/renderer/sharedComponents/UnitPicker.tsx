import { Button, FormControl, Popover, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from 'react'
import { ALL_UNITS, type AllUnits } from '../../shared/units.types'
import { useAppTranslation } from '../hooks/useTranslation'
import { SPACING } from '../styles/consts'

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

  const open = Boolean(anchorEl)

  const handleSelect = (v: AllUnits) => {
    onChange(v)
    setAnchorEl(null)
  }

  return (
    <FormControl size="small" fullWidth={fullWidth} required={required}>
      <Button disabled={disabled} variant="outlined" size="medium" onClick={(e) => setAnchorEl(e.currentTarget)}>
        {t(`${value}_plural`)}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Stack spacing={SPACING.TINY.PX} direction="column" padding={SPACING.TINY.PX} sx={{ width: '200px' }}>
          <ToggleButtonGroup
            color="primary"
            fullWidth
            value={value}
            exclusive
            onChange={(_, v) => v && handleSelect(v)}
            size="small"
          >
            <ToggleButton fullWidth value={ALL_UNITS.units}>
              {t('units')}
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            color="primary"
            fullWidth
            value={value}
            exclusive
            onChange={(_, v) => v && handleSelect(v)}
            size="small"
          >
            <ToggleButton fullWidth value={ALL_UNITS.milligrams}>
              mg
            </ToggleButton>
            <ToggleButton fullWidth value={ALL_UNITS.grams}>
              g
            </ToggleButton>
            <ToggleButton fullWidth value={ALL_UNITS.kilograms}>
              kg
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            color="primary"
            fullWidth
            value={value}
            exclusive
            onChange={(_, v) => v && handleSelect(v)}
            size="small"
          >
            <ToggleButton fullWidth value={ALL_UNITS.milliliters}>
              ml
            </ToggleButton>
            <ToggleButton fullWidth value={ALL_UNITS.liters}>
              l
            </ToggleButton>
            <ToggleButton fullWidth value={ALL_UNITS.cups}>
              {t('cups_plural')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Popover>
    </FormControl>
  )
}

export default UnitSelect
