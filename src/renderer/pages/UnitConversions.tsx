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

// Volume conversion factors (to milliliters)
const VOLUME_TO_ML = {
  milliliters: 1,
  liters: 1000,
  cups: 236.588, // US cup
  gallons: 3785.41, // US gallon
}

// Weight conversion factors (to grams)
const WEIGHT_TO_GRAMS = {
  grams: 1,
  kilograms: 1000,
  ounces: 28.3495,
  pounds: 453.592,
}

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
                  {t(unit)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {volumeUnits.map(fromUnit => (
              <TableRow key={fromUnit}>
                <TableCell component="th" scope="row">
                  <strong>1 {t(fromUnit)}</strong>
                </TableCell>
                {volumeUnits.map(toUnit => {
                  const fromML = VOLUME_TO_ML[fromUnit]
                  const toML = VOLUME_TO_ML[toUnit]
                  const conversion = fromML / toML

                  return (
                    <TableCell key={toUnit} align="right">
                      {fromUnit === toUnit ? '1' : conversion.toFixed(4)}
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
                  {t(unit)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weightUnits.map(fromUnit => (
              <TableRow key={fromUnit}>
                <TableCell component="th" scope="row">
                  <strong>1 {t(fromUnit)}</strong>
                </TableCell>
                {weightUnits.map(toUnit => {
                  const fromGrams = WEIGHT_TO_GRAMS[fromUnit]
                  const toGrams = WEIGHT_TO_GRAMS[toUnit]
                  const conversion = fromGrams / toGrams

                  return (
                    <TableCell key={toUnit} align="right">
                      {fromUnit === toUnit ? '1' : conversion.toFixed(4)}
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
