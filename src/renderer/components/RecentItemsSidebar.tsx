import { Box, Button, IconButton, List, ListItemButton, ListItemText, Stack, Tooltip, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../consts'
import { useRecentItems, type RecentItemType } from '../hooks/useRecentItems'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAppTranslation } from '../hooks/useTranslation'
import Icon from '../sharedComponents/Icon'
import { SPACING } from '../styles/consts'
import { LOCAL_STORAGE_KEYS } from '../utilities'

const getItemHref = (id: string, type: RecentItemType) => {
  return type === 'ingredient' ? ROUTES.ingredientDetail.href(id) : ROUTES.recipeDetail.href(id)
}

const RecentItemsSidebar = () => {
  const { pinnedItems, recentItems, togglePin, removeItem, clearAll } = useRecentItems()
  const [isOpen, setIsOpen] = useLocalStorage(LOCAL_STORAGE_KEYS.RECENT_SIDEBAR_OPEN, true)
  const { t } = useAppTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const activeId =
    location.pathname.match(/^\/recipe\/(.+)$/)?.[1] ||
    location.pathname.match(/^\/ingredient\/(.+)$/)?.[1]

  if (!isOpen) {
    return (
      <Box
        sx={{
          borderLeft: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'flex-start',
          pt: SPACING.SMALL.PX,
          px: SPACING.TINY.PX,
        }}
      >
        <Tooltip title={t('recentItems')}>
          <IconButton size="small" onClick={() => setIsOpen(true)}>
            <Icon name="history" size={20} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  const isEmpty = pinnedItems.length === 0 && recentItems.length === 0

  return (
    <Box
      sx={{
        width: 200,
        minWidth: 200,
        borderLeft: 1,
        borderColor: 'divider',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: SPACING.SMALL.PX, pt: SPACING.SMALL.PX, pb: SPACING.TINY.PX }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {t('recentItems')}
        </Typography>
        <IconButton size="small" onClick={() => setIsOpen(false)}>
          <Icon name="close" size={16} />
        </IconButton>
      </Stack>

      {isEmpty && (
        <Typography variant="body2" color="text.secondary" sx={{ px: SPACING.SMALL.PX, py: SPACING.SMALL.PX }}>
          {t('noRecentItems')}
        </Typography>
      )}

      {pinnedItems.length > 0 && (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: SPACING.SMALL.PX, pt: SPACING.TINY.PX, pb: SPACING.TINY.PX, fontWeight: 600 }}
          >
            {t('pinnedItems')}
          </Typography>
          <List dense disablePadding>
            {pinnedItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeId === item.id}
                onClick={() => navigate(getItemHref(item.id, item.type))}
                sx={{ py: SPACING.TINY.PX, px: SPACING.SMALL.PX }}
              >
                <Icon name={item.type === 'ingredient' ? 'ingredient' : 'recipe'} size={14} />
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{ noWrap: true, variant: 'body2' }}
                  sx={{ ml: SPACING.TINY.PX }}
                />
                <Tooltip title={t('unpinRecipe')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePin(item.id)
                    }}
                    sx={{ ml: SPACING.TINY.PX }}
                  >
                    <Icon name="pin" size={14} />
                  </IconButton>
                </Tooltip>
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      {recentItems.length > 0 && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: SPACING.SMALL.PX, pt: SPACING.TINY.PX, pb: SPACING.TINY.PX }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {t('recentItems')}
            </Typography>
            <Button size="small" onClick={clearAll} sx={{ minWidth: 0, px: SPACING.TINY.PX, fontSize: '0.7rem' }}>
              {t('clearAll')}
            </Button>
          </Stack>
          <List dense disablePadding>
            {recentItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeId === item.id}
                onClick={() => navigate(getItemHref(item.id, item.type))}
                sx={{ py: SPACING.TINY.PX, px: SPACING.SMALL.PX }}
              >
                <Icon name={item.type === 'ingredient' ? 'ingredient' : 'recipe'} size={14} />
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{ noWrap: true, variant: 'body2' }}
                  sx={{ ml: SPACING.TINY.PX }}
                />
                <Tooltip title={t('pinRecipe')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePin(item.id)
                    }}
                    sx={{ ml: SPACING.TINY.PX }}
                  >
                    <Icon name="pinOutline" size={14} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('removeFromRecent')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(item.id)
                    }}
                  >
                    <Icon name="close" size={14} />
                  </IconButton>
                </Tooltip>
              </ListItemButton>
            ))}
          </List>
        </>
      )}
    </Box>
  )
}

export default RecentItemsSidebar
