import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { useNavigate, useParams } from 'react-router-dom'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS, ROUTES } from '../../consts'
import { useAppTranslation } from '../../hooks/useTranslation'
import ipcMessenger from '../../ipcMessenger'
import Icon from '../../sharedComponents/Icon'
import Link from '../../sharedComponents/Link'
import { MODAL_ID } from '../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../signals'
import { SPACING } from '../../styles/consts'
import { ICON_SIZE } from '../../styles/tableConsts'
import { formatCurrency, getUnitLabel } from '../../utilities'
import Table from '../BrowseRecipes/components/Recipe/components/Table'

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useAppTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.RECIPE, id],
    queryFn: async () => {
      if (!id) throw new Error(t('recipeNotFound'))
      return ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, { id })
    },
    enabled: !!id,
  })

  if (!id || (!isLoading && (!data || !data.recipe))) {
    return (
      <Box sx={{ padding: SPACING.MEDIUM.PX }}>
        <Button startIcon={<Icon name="arrowBack" size={16} />} onClick={() => navigate(ROUTES.recipes.href())}>
          {t('backToRecipes')}
        </Button>
        <Typography sx={{ mt: SPACING.MEDIUM.PX }}>{t('recipeNotFound')}</Typography>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ padding: SPACING.MEDIUM.PX }}>
        <Typography>{t('loading')}</Typography>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ padding: SPACING.MEDIUM.PX }}>
        <Button startIcon={<Icon name="arrowBack" size={16} />} onClick={() => navigate(ROUTES.recipes.href())}>
          {t('backToRecipes')}
        </Button>
        <Typography sx={{ mt: SPACING.MEDIUM.PX }}>{t('errorLoadingRecipe')}</Typography>
      </Box>
    )
  }

  const recipe = data.recipe
  const unitCost = recipe.produces > 0 ? recipe.cost / recipe.produces : 0

  const handleEdit = () => {
    activeModalSignal.value = {
      id: MODAL_ID.EDIT_RECIPE_MODAL,
      recipe,
    }
  }

  const handleExport = () => {
    activeModalSignal.value = {
      id: MODAL_ID.EXPORT_RECIPES,
      recipes: [recipe],
    }
  }

  const handleDelete = async () => {
    try {
      const response = await ipcMessenger.invoke(CHANNEL.DB.DELETE_RECIPE, { id: recipe.id })
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        navigate(ROUTES.recipes.href())
      }
    } catch (error) {
      log.error('Failed to delete recipe:', error)
    }
  }

  const handleConfirmDelete = () => {
    activeModalSignal.value = {
      id: MODAL_ID.CONFIRMATION_MODAL,
      title: t('confirmDeleteRecipe'),
      body: t('deleteRecipeConfirmation'),
      confirmationCallback: handleDelete,
      showCancel: true,
    }
  }

  return (
    <Box sx={{ padding: SPACING.MEDIUM.PX, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: SPACING.MEDIUM.PX }}>
        <Button
          size="small"
          startIcon={<Icon name="arrowBack" size={16} />}
          onClick={() => navigate(ROUTES.recipes.href())}
        >
          {t('backToRecipes')}
        </Button>
        <Stack direction="row" spacing={SPACING.TINY.PX}>
          <Tooltip title={t('editRecipe')}>
            <IconButton size="small" onClick={handleEdit}>
              <Icon size={ICON_SIZE} name="edit" />
            </IconButton>
          </Tooltip>
          <Tooltip title={`${t('export')} PDF`}>
            <IconButton size="small" onClick={handleExport}>
              <Icon size={ICON_SIZE} name="download" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('deleteRecipe')}>
            <IconButton size="small" onClick={handleConfirmDelete}>
              <Icon size={ICON_SIZE} name="delete" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Recipe summary */}
      <Stack direction="row" spacing={SPACING.MEDIUM.PX} alignItems="baseline" sx={{ mb: SPACING.SMALL.PX }}>
        <Typography variant="h5">{recipe.title}</Typography>
        <Chip label={t(recipe.status)} size="small" />
        {recipe.showInMenu && <Chip label={t('showInMenu')} size="small" color="primary" variant="outlined" />}
      </Stack>

      <Stack direction="row" spacing={SPACING.MEDIUM.PX} sx={{ mb: SPACING.MEDIUM.PX }}>
        <Typography variant="body2" color="textSecondary">
          {t('produces')}: {recipe.produces} {getUnitLabel(recipe.units, 'plural')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('totalCost')}: {formatCurrency(recipe.cost)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('unitCost')}: {formatCurrency(unitCost)}
        </Typography>
      </Stack>

      {/* Used In */}
      {data.usedInRecipes.length > 0 && (
        <Typography variant="body2" sx={{ mb: SPACING.MEDIUM.PX }}>
          {t('usedIn')}:{' '}
          {data.usedInRecipes.map((r, i) => (
            <span key={r.id}>
              {i > 0 && ', '}
              <Link to={ROUTES.recipeDetail.href(r.id)}>{r.title}</Link>
            </span>
          ))}
        </Typography>
      )}

      {/* Ingredients & Sub-recipes table */}
      <Table ingredients={data.ingredients} recipe={recipe} subRecipes={data.subRecipes} />
    </Box>
  )
}

export default RecipeDetail
