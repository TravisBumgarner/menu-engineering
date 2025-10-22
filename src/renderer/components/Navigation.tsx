import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { ROUTES } from '../consts'
import { useAppTranslation } from '../hooks/useTranslation'
import LanguageSwitcher from './LanguageSwitcher'

const NAV_ROUTES: Array<keyof typeof ROUTES> = [
  'recipes',
  'ingredients',
  'unitConversions',
]

const Navigation = () => {
  const location = useLocation()
  const { t } = useAppTranslation()

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('appTitle')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {NAV_ROUTES.map(key => {
            const route = ROUTES[key]
            const isActive = location.pathname === route.href()

            return (
              <Button
                size="small"
                key={key}
                component={RouterLink}
                to={route.href()}
                variant={isActive ? 'contained' : 'text'}
                color={isActive ? 'primary' : 'inherit'}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                }}
              >
                {t(key)}
              </Button>
            )
          })}
          <LanguageSwitcher />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navigation
