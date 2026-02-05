import { Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import type { IngredientDTO, RelationDTO } from '../../../../../../shared/recipe.types'
import type { AllUnits } from '../../../../../../shared/units.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import Icon from '../../../../../sharedComponents/Icon'
import { NumericInput } from '../../../../../sharedComponents/NumericInput'
import { activeModalSignal } from '../../../../../signals'
import { cellSx, ICON_SIZE } from '../../../../../styles/tableConsts'
import { formatCurrency, formatDisplayDate } from '../../../../../utilities'

function IngredientRow(props: { row: IngredientDTO & { relation: RelationDTO }; recipeId: string; labelId: string }) {
  const { row, recipeId, labelId } = props
  // const [open, setOpen] = React.useState(false)
  const queryClient = useQueryClient()
  const { t } = useAppTranslation()

  const removeIngredientMutation = useMutation({
    mutationFn: () =>
      ipcMessenger.invoke(CHANNEL.DB.REMOVE_INGREDIENT_FROM_RECIPE, {
        ingredientId: row.id,
        recipeId: recipeId,
      }),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch the recipe query to update the ingredients list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPE, recipeId],
        })
      } else {
        alert('Failed to remove ingredient from recipe.')
      }
    },
    onError: () => {
      alert('Error removing ingredient from recipe.')
    },
  })

  const handleOpenEditModal = () => {
    activeModalSignal.value = {
      id: 'EDIT_INGREDIENT_MODAL',
      ingredient: row,
    }
  }

  const updateIngredientRelationMutation = useMutation({
    mutationFn: (updateData: { quantity?: number; units?: AllUnits }) =>
      ipcMessenger.invoke(CHANNEL.DB.UPDATE_RECIPE_RELATION, {
        parentId: recipeId,
        childId: row.id,
        type: 'ingredient' as const,
        quantity: updateData.quantity,
        units: updateData.units,
      }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPE, recipeId],
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPES],
        })
      } else {
        alert('Failed to update ingredient relation.')
      }
    },
    onError: () => {
      alert('Error updating ingredient relation.')
    },
  })

  const handleOpenRemoveModal = () => {
    activeModalSignal.value = {
      id: 'CONFIRMATION_MODAL',
      title: 'Remove Ingredient',
      body: `Are you sure you want to remove the ingredient "${row.title}" from this recipe? This action cannot be undone.`,
      confirmationCallback: () => {
        removeIngredientMutation.mutate()
        activeModalSignal.value = null
      },
    }
  }

  const relationCost = React.useMemo(() => {
    return row.relation.quantity * row.unitCost
  }, [row.unitCost, row.relation.quantity])

  const handleQuantityChange = (newQuantity: number) => {
    updateIngredientRelationMutation.mutate({
      quantity: newQuantity,
    })
  }

  return (
    <TableRow tabIndex={-1} key={row.id}>
      <TableCell sx={cellSx}>{formatDisplayDate(row.createdAt)}</TableCell>
      <TableCell sx={cellSx} id={labelId} scope="row">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* <Icon name="ingredient" size={ICON_SIZE} /> */}
          {row.title}{' '}
        </Box>{' '}
      </TableCell>
      <TableCell sx={cellSx} align="right" id={labelId} scope="row">
        <NumericInput size="small" value={row.relation.quantity} onValidChange={handleQuantityChange} min={0} />
      </TableCell>
      <TableCell sx={cellSx} align="left" id={labelId} scope="row">
        {row.units}
      </TableCell>
      <TableCell sx={cellSx} align="right" id={labelId} scope="row">
        {formatCurrency(row.unitCost)}
      </TableCell>
      <TableCell sx={cellSx} align="right" id={labelId} scope="row">
        {formatCurrency(relationCost)}
      </TableCell>
      <TableCell sx={cellSx} align="right">
        <Tooltip title={t('editIngredient')}>
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

export default IngredientRow
