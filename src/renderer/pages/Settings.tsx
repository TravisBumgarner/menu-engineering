import { Box, Button, Typography } from '@mui/material'
import i18n from '../internationalization'

const Settings = () => {
  return (
    <Box>
      <Typography variant="h1">Settings</Typography>
      <Button onClick={() => i18n.changeLanguage('en')}>English</Button>
      <Button onClick={() => i18n.changeLanguage('es')}>Español</Button>
    </Box>
  )
}
export default Settings
