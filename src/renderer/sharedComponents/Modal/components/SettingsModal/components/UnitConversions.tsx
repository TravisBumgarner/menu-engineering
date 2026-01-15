import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { VOLUME_UNIT, type VolumeUnit, WEIGHT_UNIT, type WeightUnit } from '../../../../../../shared/units.types'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import { SPACING } from '../../../../../styles/consts'
import { convertUnits } from '../../../../../utilities'
import type { UnitPreferences } from './TabUnitPreferences'

const VolumeConversionTable = ({ enabledUnits }: { enabledUnits: string[] }) => {
  const { t } = useAppTranslation()

  const volumeUnits = (Object.keys(VOLUME_UNIT) as VolumeUnit[]).filter((unit) => enabledUnits.includes(unit))

  return (
    <>
      <Typography variant="body1" gutterBottom>
        {t('volumeConversions')}
      </Typography>
      <TableContainer sx={{ boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {volumeUnits.map((unit) => (
                <TableCell key={unit} align="right">
                  {t(`${unit}_abbreviated`)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {volumeUnits.map((fromUnit) => (
              <TableRow key={fromUnit}>
                <TableCell component="th" scope="row">
                  <strong>1 {t(`${fromUnit}_abbreviated`)}</strong>
                </TableCell>
                {volumeUnits.map((toUnit) => {
                  const conversion = convertUnits({
                    from: fromUnit,
                    to: toUnit,
                    value: 1,
                  })

                  return (
                    <TableCell key={toUnit} align="right">
                      {fromUnit === toUnit ? '1' : (conversion?.toFixed(4) ?? 'N/A')}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

const WeightConversionTable = ({ enabledUnits }: { enabledUnits: string[] }) => {
  const { t } = useAppTranslation()

  const weightUnits = (Object.keys(WEIGHT_UNIT) as WeightUnit[]).filter((unit) => enabledUnits.includes(unit))

  return (
    <>
      <Typography variant="body1" gutterBottom>
        {t('weightConversions')}
      </Typography>
      <TableContainer sx={{ boxShadow: 'none' }}>
        <Table size="small" sx={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {weightUnits.map((unit) => (
                <TableCell key={unit} align="right">
                  {t(`${unit}_abbreviated`)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weightUnits.map((fromUnit) => (
              <TableRow key={fromUnit}>
                <TableCell component="th" scope="row">
                  <strong>1 {t(`${fromUnit}_abbreviated`)}</strong>
                </TableCell>
                {weightUnits.map((toUnit) => {
                  const conversion = convertUnits({
                    from: fromUnit,
                    to: toUnit,
                    value: 1,
                  })

                  return (
                    <TableCell key={toUnit} align="right">
                      {fromUnit === toUnit ? '1' : (conversion?.toFixed(4) ?? 'N/A')}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

const UnitConversions = ({ unitPreferences }: { unitPreferences: UnitPreferences }) => {
  return (
    <Stack spacing={SPACING.MEDIUM.PX} sx={{ flexGrow: 1 }}>
      <VolumeConversionTable enabledUnits={unitPreferences.volume} />
      <WeightConversionTable enabledUnits={unitPreferences.weight} />
    </Stack>
  )
}

export default UnitConversions
