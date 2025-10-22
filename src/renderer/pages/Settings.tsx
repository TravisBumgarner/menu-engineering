import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import i18n from '../internationalization'

const Settings = () => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant="h1">{t('settings')}</Typography>
      <Button onClick={() => i18n.changeLanguage('en')}>English</Button>
      <Button onClick={() => i18n.changeLanguage('es')}>Español</Button>
    </Box>
  )
}
export default Settings
