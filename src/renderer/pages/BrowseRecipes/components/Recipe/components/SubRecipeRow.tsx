import { Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CHANNEL } from '../../../../../../shared/messages.types'
import type { RecipeDTO, RelationDTO } from '../../../../../../shared/recipe.types'
import type { AllUnits } from '../../../../../../shared/units.types'
import { QUERY_KEYS, ROUTES } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import Icon from '../../../../../sharedComponents/Icon'
import { NumericInput } from '../../../../../sharedComponents/NumericInput'
import { activeModalSignal } from '../../../../../signals'
import { cellSx, ICON_SIZE } from '../../../../../styles/tableConsts'
import { formatCurrency, formatDisplayDate } from '../../../../../utilities'

function SubRecipeRow(props: { row: RecipeDTO & { relation: RelationDTO }; recipeId: string; labelId: string }) {
  const { row, recipeId, labelId } = props
  const queryClient = useQueryClient()
  const { t } = useAppTranslation()
  const navigate = useNavigate()

  const updateSubRecipeRelationMutation = useMutation({
    mutationFn: (updateData: { quantity?: number; units?: AllUnits }) => {
      return ipcMessenger.invoke(CHANNEL.DB.UPDATE_RECIPE_RELATION, {
        parentId: recipeId,
        childId: row.id,
        type: 'sub-recipe' as const,
        quantity: updateData.quantity,
        units: updateData.units,
      })
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPES],
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPE, recipeId],
        })
      } else {
        alert('Failed to update sub-recipe relation.')
      }
    },
    onError: () => {
      alert('Error updating sub-recipe relation.')
    },
  })

  const removeSubRecipeMutation = useMutation({
    mutationFn: () =>
      ipcMessenger.invoke(CHANNEL.DB.REMOVE_SUB_RECIPE_FROM_RECIPE, {
        subRecipeId: row.id,
        recipeId: recipeId,
      }),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch the recipe query to update the sub-recipes list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPE, recipeId],
        })
      } else {
        alert('Failed to remove sub-recipe from recipe.')
      }
    },
    onError: () => {
      alert('Error removing sub-recipe from recipe.')
    },
  })

  const handleOpenEditModal = () => {
    activeModalSignal.value = {
      id: 'EDIT_RECIPE_MODAL',
      recipe: row,
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    updateSubRecipeRelationMutation.mutate({
      quantity: newQuantity,
    })
  }

  const handleOpenRemoveModal = () => {
    activeModalSignal.value = {
      id: 'CONFIRMATION_MODAL',
      title: 'Remove Sub Recipe',
      body: `Are you sure you want to remove the sub recipe "${row.title}" from this recipe? This action cannot be undone.`,
      confirmationCallback: () => {
        removeSubRecipeMutation.mutate()
        activeModalSignal.value = null
      },
    }
  }

  const handleNavigateToRecipe = () => {
    navigate(ROUTES.recipeDetail.href(row.id))
  }

  return (
    <TableRow tabIndex={-1} key={row.id} hover sx={{ cursor: 'pointer' }} onClick={handleNavigateToRecipe}>
      <TableCell sx={cellSx}>{formatDisplayDate(row.createdAt)}</TableCell>
      <TableCell sx={cellSx} id={labelId} scope="row">
        {row.title}
      </TableCell>
      <TableCell sx={cellSx} align="right" id={labelId} scope="row" onClick={(e) => e.stopPropagation()}>
        <NumericInput size="small" value={row.relation?.quantity || 0} onValidChange={handleQuantityChange} min={0} />
      </TableCell>
      <TableCell sx={cellSx} align="left" id={labelId} scope="row">
        {row.units}
      </TableCell>
      <TableCell sx={cellSx} align="right" id={labelId} scope="row">
        {formatCurrency(row.cost / row.produces)}
      </TableCell>
      <TableCell sx={cellSx} align="right" id={labelId} scope="row">
        {formatCurrency((row.cost / row.produces) * row.relation.quantity)}
      </TableCell>
      <TableCell sx={cellSx} align="right" onClick={(e) => e.stopPropagation()}>
        <Tooltip title={t('editRecipe')}>
          <IconButton size="small" onClick={handleOpenEditModal}>
            <Icon size={ICON_SIZE} name="edit" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('remove')}>
          <IconButton size="small" onClick={handleOpenRemoveModal}>
            <Icon size={ICON_SIZE} name="close" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}

export default SubRecipeRow
