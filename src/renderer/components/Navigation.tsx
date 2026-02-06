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

const NAV_ROUTES = ['recipes', 'ingredients'] as const

const Navigation = () => {
  const location = useLocation()
  const { t } = useAppTranslation()

  const handleOpenSettingsModal = () => {
    activeModalSignal.value = { id: MODAL_ID.SETTINGS_MODAL }
  }

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar variant="dense">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: SPACING.XXXS.PX,
              alignItems: 'center',
            }}
          >
            {NAV_ROUTES.map((key) => {
              const route = ROUTES[key]
              const href = route.href()
              const isActive = location.pathname === href

              return (
                <Button
                  size="small"
                  key={key}
                  component={RouterLink}
                  to={href}
                  sx={{
                    minWidth: 'auto',
                    fontWeight: isActive ? 600 : 400,
                    color: (theme) => isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                    backgroundColor: (theme) => (isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent'),
                    borderRadius: '6px',
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
                    },
                  }}
                >
                  {t(key)}
                </Button>
              )
            })}
          </Box>
          <Tooltip title={t('settings')}>
            <IconButton size="small" onClick={handleOpenSettingsModal}>
              <Icon name="settings" size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navigation
