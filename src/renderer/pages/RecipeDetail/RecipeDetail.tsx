import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS, ROUTES } from '../../consts'
import { useRecentItems } from '../../hooks/useRecentItems'
import { useAppTranslation } from '../../hooks/useTranslation'
import ipcMessenger from '../../ipcMessenger'
import Icon from '../../sharedComponents/Icon'
import Link from '../../sharedComponents/Link'
import Photo from '../../sharedComponents/Photo'
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
  const { addRecentItem } = useRecentItems()

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.RECIPE, id],
    queryFn: async () => {
      if (!id) throw new Error(t('recipeNotFound'))
      return ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, { id })
    },
    enabled: !!id,
  })

  const { data: categoriesData } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_CATEGORIES, undefined),
  })

  useEffect(() => {
    if (data?.recipe) {
      addRecentItem(data.recipe.id, data.recipe.title, 'recipe')
    }
  }, [data?.recipe?.id, data?.recipe?.title, addRecentItem])

  if (!id || (!isLoading && (!data || !data.recipe))) {
    return (
      <Box>
        <Button startIcon={<Icon name="arrowBack" size={16} />} onClick={() => navigate(ROUTES.recipes.href())}>
          {t('backToRecipes')}
        </Button>
        <Typography sx={{ mt: SPACING.MEDIUM.PX }}>{t('recipeNotFound')}</Typography>
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
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: SPACING.SM.PX }}>
        <Button
          size="small"
          startIcon={<Icon name="arrowBack" size={16} />}
          onClick={() => navigate(ROUTES.recipes.href())}
        >
          {t('backToRecipes')}
        </Button>
        <Stack direction="row" spacing={SPACING.XXXS.PX}>
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
      <Box
        sx={{
          mb: SPACING.MD.PX,
          p: SPACING.SM.PX,
          backgroundColor: 'background.paper',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
      <Stack direction="row" spacing={SPACING.SM.PX}>
        {recipe.photoSrc && (
          <Box>
            <Photo type="backend" src={recipe.photoSrc} />
          </Box>
        )}

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={SPACING.XXS.PX} alignItems="center" sx={{ mb: SPACING.XS.PX }}>
            <Typography variant="h5">{recipe.title}</Typography>
            <Chip label={t(recipe.status)} size="small" variant="outlined" />
            {recipe.showInMenu && <Chip label={t('showInMenu')} size="small" color="primary" variant="outlined" />}
            {recipe.categoryIds?.map((catId) => {
              const cat = categoriesData?.categories?.find((c) => c.id === catId)
              return cat ? <Chip key={catId} label={cat.title} size="small" variant="outlined" /> : null
            })}
          </Stack>

          <Stack direction="row" spacing={SPACING.LG.PX} sx={{ mb: SPACING.XXS.PX }}>
            <Box>
              <Typography variant="caption" color="text.secondary">{t('produces')}</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{recipe.produces} {getUnitLabel(recipe.units, 'plural')}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">{t('totalCost')}</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatCurrency(recipe.cost)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">{t('unitCost')}</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatCurrency(unitCost)}</Typography>
            </Box>
          </Stack>

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
        </Box>
      </Stack>
      </Box>

      {/* Ingredients & Sub-recipes table */}
      <Table ingredients={data.ingredients} recipe={recipe} subRecipes={data.subRecipes} />
    </Box>
  )
}

export default RecipeDetail
