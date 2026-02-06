import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS, ROUTES } from '../../consts'
import { useRecentItems } from '../../hooks/useRecentItems'
import { useAppTranslation } from '../../hooks/useTranslation'
import ipcMessenger from '../../ipcMessenger'
import Icon from '../../sharedComponents/Icon'
import Link from '../../sharedComponents/Link'
import { MODAL_ID } from '../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../signals'
import { SPACING } from '../../styles/consts'
import { ICON_SIZE } from '../../styles/tableConsts'
import { formatCurrency, getUnitLabel } from '../../utilities'

const IngredientDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useAppTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addRecentItem } = useRecentItems()

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.INGREDIENT, id],
    queryFn: async () => {
      if (!id) throw new Error(t('ingredientNotFound'))
      return ipcMessenger.invoke(CHANNEL.DB.GET_INGREDIENT, { id })
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (data?.ingredient) {
      addRecentItem(data.ingredient.id, data.ingredient.title, 'ingredient')
    }
  }, [data?.ingredient?.id, data?.ingredient?.title, addRecentItem])

  if (!id || (!isLoading && (!data || !data.ingredient))) {
    return (
      <Box>
        <Button
          startIcon={<Icon name="arrowBack" size={16} />}
          onClick={() => navigate(ROUTES.ingredients.href())}
        >
          {t('backToIngredients')}
        </Button>
        <Typography sx={{ mt: SPACING.SM.PX }}>{t('ingredientNotFound')}</Typography>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box>
        <Typography>{t('loading')}</Typography>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box>
        <Button
          startIcon={<Icon name="arrowBack" size={16} />}
          onClick={() => navigate(ROUTES.ingredients.href())}
        >
          {t('backToIngredients')}
        </Button>
        <Typography sx={{ mt: SPACING.SM.PX }}>{t('errorLoadingIngredients')}</Typography>
      </Box>
    )
  }

  const ingredient = data.ingredient

  const handleEdit = () => {
    activeModalSignal.value = {
      id: MODAL_ID.EDIT_INGREDIENT_MODAL,
      ingredient,
    }
  }

  const handleDelete = async () => {
    try {
      const response = await ipcMessenger.invoke(CHANNEL.DB.DELETE_INGREDIENT, { id: ingredient.id })
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INGREDIENTS] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INGREDIENT] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        navigate(ROUTES.ingredients.href())
      }
    } catch (error) {
      log.error('Failed to delete ingredient:', error)
    }
  }

  const handleConfirmDelete = () => {
    activeModalSignal.value = {
      id: MODAL_ID.CONFIRMATION_MODAL,
      title: t('confirmDeleteIngredient'),
      body: t('deleteIngredientConfirmation'),
      confirmationCallback: handleDelete,
      showCancel: true,
    }
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: SPACING.SM.PX }}>
        <Button
          size="small"
          startIcon={<Icon name="arrowBack" size={16} />}
          onClick={() => navigate(ROUTES.ingredients.href())}
        >
          {t('backToIngredients')}
        </Button>
        <Stack direction="row" spacing={SPACING.TINY.PX}>
          <Tooltip title={t('editIngredient')}>
            <IconButton size="small" onClick={handleEdit}>
              <Icon size={ICON_SIZE} name="edit" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('deleteIngredient')}>
            <IconButton size="small" onClick={handleConfirmDelete}>
              <Icon size={ICON_SIZE} name="delete" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Ingredient summary */}
      <Box
        sx={{
          p: SPACING.SM.PX,
          backgroundColor: 'background.paper',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" sx={{ mb: SPACING.XS.PX }}>
          {ingredient.title}
        </Typography>

        <Stack direction="row" spacing={SPACING.LG.PX} sx={{ mb: SPACING.XS.PX }}>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('units')}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{getUnitLabel(ingredient.units, 'plural')}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('unitCost')}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatCurrency(ingredient.unitCost)}</Typography>
          </Box>
        </Stack>

        {/* Used In */}
        {data.usedInRecipes.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">{t('usedIn')}</Typography>
            <Typography variant="body2">
              {data.usedInRecipes.map((r, i) => (
                <span key={r.id}>
                  {i > 0 && ', '}
                  <Link to={ROUTES.recipeDetail.href(r.id)}>{r.title}</Link>
                </span>
              ))}
            </Typography>
          </Box>
        )}

        {data.usedInRecipes.length === 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">{t('usedIn')}</Typography>
            <Typography variant="body2">0 {t('recipes')}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default IngredientDetail
