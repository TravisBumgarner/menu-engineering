import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import {
  VOLUME_UNIT,
  VolumeUnit,
  WEIGHT_UNIT,
  WeightUnit,
} from '../../shared/units.types'
import { useAppTranslation } from '../hooks/useTranslation'
import { convertUnits } from '../utilities'

const VolumeConversionTable = () => {
  const { t } = useAppTranslation()

  const volumeUnits = Object.keys(VOLUME_UNIT) as VolumeUnit[]

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {t('volumeConversions')}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {volumeUnits.map(unit => (
                <TableCell key={unit} align="right">
                  {t(`${unit}_plural`)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {volumeUnits.map(fromUnit => (
              <TableRow key={fromUnit}>
                <TableCell component="th" scope="row">
                  <strong>1 {t(`${fromUnit}_plural`)}</strong>
                </TableCell>
                {volumeUnits.map(toUnit => {
                  const conversion = convertUnits({
                    from: fromUnit,
                    to: toUnit,
                    value: 1,
                  })

                  return (
                    <TableCell key={toUnit} align="right">
                      {fromUnit === toUnit
                        ? '1'
                        : (conversion?.toFixed(4) ?? 'N/A')}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

const WeightConversionTable = () => {
  const { t } = useAppTranslation()

  const weightUnits = Object.keys(WEIGHT_UNIT) as WeightUnit[]

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {t('weightConversions')}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {weightUnits.map(unit => (
                <TableCell key={unit} align="right">
                  {t(`${unit}_plural`)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weightUnits.map(fromUnit => (
              <TableRow key={fromUnit}>
                <TableCell component="th" scope="row">
                  <strong>1 {t(`${fromUnit}_plural`)}</strong>
                </TableCell>
                {weightUnits.map(toUnit => {
                  const conversion = convertUnits({
                    from: fromUnit,
                    to: toUnit,
                    value: 1,
                  })

                  return (
                    <TableCell key={toUnit} align="right">
                      {fromUnit === toUnit
                        ? '1'
                        : (conversion?.toFixed(4) ?? 'N/A')}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

const UnitConversions = () => {
  const { t } = useAppTranslation()

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('unitConversions')}
      </Typography>

      <VolumeConversionTable />
      <WeightConversionTable />

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        * {t('conversionDisclaimer')}
      </Typography>
    </Box>
  )
}

export default UnitConversions
