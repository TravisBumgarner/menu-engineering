import { alpha, IconButton, Tooltip } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { ROUTES } from '../consts'
import { useAppTranslation } from '../hooks/useTranslation'
import Icon from '../sharedComponents/Icon'
import { MODAL_ID } from '../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../signals'
import { SPACING } from '../styles/consts'

const NAV_ROUTES: Array<keyof typeof ROUTES> = ['recipes', 'ingredients']

const Navigation = () => {
  const location = useLocation()
  const { t } = useAppTranslation()

  const handleOpenSettingsModal = () => {
    activeModalSignal.value = { id: MODAL_ID.SETTINGS_MODAL }
  }

  const handleOpenChangelogModal = () => {
    activeModalSignal.value = { id: MODAL_ID.CHANGELOG_MODAL }
  }

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar variant="dense">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: SPACING.SMALL.PX,
              alignItems: 'center',
            }}
          >
            {NAV_ROUTES.map((key) => {
              const route = ROUTES[key]
              const isActive = location.pathname === route.href()

              return (
                <Button
                  size="small"
                  key={key}
                  component={RouterLink}
                  to={route.href()}
                  color={isActive ? 'primary' : 'inherit'}
                  sx={{
                    minWidth: 'auto',
                    backgroundColor: (theme) => (isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent'),
                    border: '1px solid',
                    borderColor: (theme) => (isActive ? alpha(theme.palette.primary.main, 0.3) : 'transparent'),
                  }}
                >
                  {t(key)}
                </Button>
              )
            })}
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: SPACING.MEDIUM.PX,
              alignItems: 'center',
            }}
          >
            <Tooltip title={t('changelog')}>
              <IconButton onClick={handleOpenChangelogModal}>
                <Icon name="history" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('settings')}>
              <IconButton onClick={handleOpenSettingsModal}>
                <Icon name="settings" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navigation
