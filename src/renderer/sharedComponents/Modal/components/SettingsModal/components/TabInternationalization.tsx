import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useLocalStorage } from '../../../../../hooks/useLocalStorage'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import { SPACING } from '../../../../../styles/consts'

const TabInternationalization = () => {
  const { t, currentLanguage, changeLanguage } = useAppTranslation()
  const [country, setCountry] = useLocalStorage<string>('country', 'US')
  const [initialCountry] = useState(country)

  // Reload the app when country changes
  useEffect(() => {
    if (country !== initialCountry) {
      window.location.reload()
    }
  }, [country, initialCountry])

  return (
    <Box>
      <Stack direction="row" spacing={SPACING.MEDIUM.PX}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label">{t('language')}</InputLabel>
          <Select
            labelId="language-select-label"
            value={currentLanguage}
            label={t('language')}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Español</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="country-select-label">{t('country')}</InputLabel>
          <Select
            labelId="country-select-label"
            value={country}
            label={t('country')}
            onChange={(e) => setCountry(e.target.value)}
          >
            <MenuItem value="US">United States</MenuItem>
            <MenuItem value="MX">Mexico</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  )
}

export default TabInternationalization
