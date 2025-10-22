import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useAppTranslation } from '../hooks/useTranslation'

const LanguageSwitcher = () => {
  const { changeLanguage, currentLanguage } = useAppTranslation()

  return (
    <FormControl size="small" sx={{ minWidth: 80 }}>
      <InputLabel>Lang</InputLabel>
      <Select
        value={currentLanguage}
        onChange={e => changeLanguage(e.target.value)}
        label="Lang"
      >
        <MenuItem value="en">EN</MenuItem>
        <MenuItem value="es">ES</MenuItem>
      </Select>
    </FormControl>
  )
}

export default LanguageSwitcher
