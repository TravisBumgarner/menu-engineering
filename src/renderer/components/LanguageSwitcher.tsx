import { FormControl, MenuItem, Select } from '@mui/material'
import { useAppTranslation } from '../hooks/useTranslation'

const LanguageSwitcher = () => {
  const { changeLanguage, currentLanguage, t } = useAppTranslation()

  return (
    <FormControl size="small" sx={{ minWidth: 80 }}>
      <Select
        size="small"
        variant="standard"
        value={currentLanguage}
        onChange={e => changeLanguage(e.target.value)}
        label={t('language')}
      >
        <MenuItem value="en">EN</MenuItem>
        <MenuItem value="es">ES</MenuItem>
      </Select>
    </FormControl>
  )
}

export default LanguageSwitcher
