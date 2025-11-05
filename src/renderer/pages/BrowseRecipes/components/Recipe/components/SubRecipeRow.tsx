import { TextField, Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import { RecipeDTO, RelationDTO } from '../../../../../../shared/recipe.types'
import { AllUnits } from '../../../../../../shared/units.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import Icon from '../../../../../sharedComponents/Icon'
import { activeModalSignal, activeRecipeIdSignal } from '../../../../../signals'
import { SPACING } from '../../../../../styles/consts'
import { formatDisplayDate } from '../../../../../utilities'
import { ICON_SIZE } from './consts'

function SubRecipeRow(props: {
  row: RecipeDTO & { relation: RelationDTO }
  recipeId: string
  labelId: string
}) {
  const { row, recipeId, labelId } = props
  // const [open, setOpen] = React.useState(false)
  const queryClient = useQueryClient()
  const { t } = useAppTranslation()

  const subRecipeCostQuery = useQuery({
    queryKey: [QUERY_KEYS.RECIPE_COST],
    queryFn: async () => {
      const result = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE_COST, {
        id: row.id,
      })
      return result
    },
  })

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
    onSuccess: result => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPE_COST],
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
      ipcMessenger.invoke(CHANNEL.DB.REMOVE_INGREDIENT_FROM_RECIPE, {
        ingredientId: row.id,
        recipeId: recipeId,
      }),
    onSuccess: result => {
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

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseFloat(event.target.value)
    if (!isNaN(newQuantity)) {
      updateSubRecipeRelationMutation.mutate({ quantity: newQuantity })
    }
  }

  const handleEditIngredients = () => {
    activeRecipeIdSignal.value = row.id
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

  return (
    <React.Fragment>
      <TableRow
        hover
        tabIndex={-1}
        key={row.id}
        sx={{ '& > *': { borderBottom: 'unset' } }}
      >
        <TableCell sx={{ padding: `0 ${SPACING.TINY.PX}` }}>
          {/* <IconButton
            aria-label="expand row"
            size="small"
            onClick={event => {
              event.stopPropagation()
              setOpen(!open)
            }}
          >
            {open ? (
              <Icon name="collapseVertical" />
            ) : (
              <Icon name="expandVertical" />
            )}
          </IconButton> */}
        </TableCell>
        <TableCell sx={{ padding: `0 ${SPACING.TINY.PX}` }}>
          {formatDisplayDate(row.createdAt)}
        </TableCell>

        <TableCell
          id={labelId}
          scope="row"
          sx={{ padding: `0 ${SPACING.TINY.PX}` }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon name="recipe" size={ICON_SIZE} /> {row.title}{' '}
            {row.id.slice(0, 6)}
          </Box>
        </TableCell>
        <TableCell
          align="right"
          id={labelId}
          scope="row"
          sx={{ padding: `0 ${SPACING.TINY.PX}` }}
        >
          <TextField
            size="small"
            type="number"
            value={row.relation?.quantity || 0}
            onChange={handleQuantityChange}
            variant="standard"
          />
        </TableCell>
        <TableCell
          align="left"
          id={labelId}
          scope="row"
          sx={{ padding: `0 ${SPACING.TINY.PX}` }}
        >
          {row.units}
        </TableCell>
        <TableCell
          align="right"
          id={labelId}
          scope="row"
          sx={{ padding: `0 ${SPACING.TINY.PX}` }}
        >
          {subRecipeCostQuery.data?.success
            ? `$${subRecipeCostQuery.data.cost.toFixed(2)}`
            : 'N/A'}
        </TableCell>
        <TableCell align="right" sx={{ padding: `0 ${SPACING.TINY.PX}` }}>
          <Tooltip title={t('editIngredients')}>
            <IconButton onClick={handleEditIngredients}>
              <Icon name="recipe" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('editRecipe')}>
            <IconButton onClick={handleOpenEditModal}>
              <Icon name="edit" />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('remove')}>
            <IconButton onClick={handleOpenRemoveModal}>
              <Icon name="close" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      {/* <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                {t('recipeDetails')}
              </Typography>
              <Table size="small" aria-label="ingredient details">
                <TableBody>
                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      ID
                    </TableCell>
                    <TableCell>{row.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      Created
                    </TableCell>
                    <TableCell>{formatDisplayDate(row.createdAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      Updated
                    </TableCell>
                    <TableCell>
                      {new Date(row.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      Produces
                    </TableCell>
                    <TableCell>
                      {row.produces} - {row.units}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      Notes
                    </TableCell>
                    <TableCell>{row.notes || <em>No notes</em>}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow> */}
    </React.Fragment>
  )
}

export default SubRecipeRow
