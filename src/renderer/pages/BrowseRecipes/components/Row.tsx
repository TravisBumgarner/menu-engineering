import { Stack, Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useQueryClient } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { useNavigate } from 'react-router-dom'
import { CHANNEL } from '../../../../shared/messages.types'
import type { RecipeDTO } from '../../../../shared/recipe.types'
import { QUERY_KEYS, ROUTES } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import Icon from '../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { cellSx, ICON_SIZE } from '../../../styles/tableConsts'
import { formatCurrency, formatDisplayDate, getUnitLabel } from '../../../utilities'

function RecipeRow({
  row,
  labelId,
}: {
  row: RecipeDTO & { usedInRecipesCount: number; hasZeroQuantity: boolean }
  labelId: string
}) {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const handleDeleteRecipe = async () => {
    try {
      const response = await ipcMessenger.invoke(CHANNEL.DB.DELETE_RECIPE, {
        id: row.id,
      })

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
      }
    } catch (error) {
      log.error('Failed to delete recipe:', error)
    }
  }

  const openEditModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.EDIT_RECIPE_MODAL,
      recipe: row,
    }
  }

  const openConfirmationModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.CONFIRMATION_MODAL,
      title: t('confirmDeleteRecipe'),
      body: t('deleteRecipeConfirmation'),
      confirmationCallback: handleDeleteRecipe,
      showCancel: true,
    }
  }

  const openExportModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.EXPORT_RECIPES,
      recipes: [row],
    }
  }

  const handleNavigateToRecipe = () => {
    navigate(ROUTES.recipeDetail.href(row.id))
  }

  return (
    <TableRow tabIndex={-1} key={row.id} hover sx={{ cursor: 'pointer' }} onClick={handleNavigateToRecipe}>
      <TableCell sx={cellSx} id={labelId} scope="row">
        {formatDisplayDate(row.createdAt)}
      </TableCell>
      <TableCell sx={cellSx} id={labelId} scope="row">
        <Stack direction="row" alignItems="center" spacing={SPACING.TINY.PX}>
          <span>{row.title}</span>
          {row.hasZeroQuantity ? (
            <Tooltip title={t('recipeHasZeroQuantity')}>
              <span>
                <Icon name="warning" />
              </span>
            </Tooltip>
          ) : null}
        </Stack>
      </TableCell>
      <TableCell sx={cellSx} align="left">
        {t(row.status)}
      </TableCell>
      <TableCell sx={cellSx} align="left">
        <Typography variant="body2">{row.showInMenu ? t('yes') : t('no')}</Typography>
      </TableCell>
      <TableCell align="right" id={labelId} scope="row" sx={cellSx}>
        {formatCurrency(row.cost)}
      </TableCell>
      <TableCell sx={cellSx} align="right">
        {row.produces} {getUnitLabel(row.units, 'plural')}
      </TableCell>
      <TableCell align="right" id={labelId} scope="row" sx={cellSx}>
        {formatCurrency(row.cost / row.produces)}
      </TableCell>
      <TableCell sx={cellSx} align="right" onClick={(e) => e.stopPropagation()}>
        <Tooltip title={t('editRecipe')}>
          <IconButton size="small" onClick={openEditModal}>
            <Icon size={ICON_SIZE} name="edit" />
          </IconButton>
        </Tooltip>
        <Tooltip title={`${t('export')} PDF`}>
          <IconButton size="small" onClick={openExportModal}>
            <Icon size={ICON_SIZE} name="download" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('deleteRecipe')}>
          <IconButton size="small" onClick={openConfirmationModal}>
            <Icon size={ICON_SIZE} name="delete" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}

export default RecipeRow
