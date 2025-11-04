import { TextField, Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import {
  IngredientDTO,
  RelationDTO,
} from '../../../../../../shared/recipe.types'
import { AllUnits } from '../../../../../../shared/units.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import Icon from '../../../../../sharedComponents/Icon'
import { activeModalSignal } from '../../../../../signals'
import { SPACING } from '../../../../../styles/consts'
import { formatDisplayDate } from '../../../../../utilities'
import { ICON_SIZE } from './consts'

function IngredientRow(props: {
  row: IngredientDTO & { relation: RelationDTO }
  recipeId: string
  labelId: string
}) {
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
    onSuccess: result => {
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
    onSuccess: result => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPE, recipeId],
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
    return row.relation.quantity * (row.cost / row.quantity)
  }, [row.cost, row.quantity, row.relation.quantity])

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseFloat(event.target.value)
    if (!isNaN(newQuantity)) {
      updateIngredientRelationMutation.mutate({ quantity: newQuantity })
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
            <Icon name="ingredient" size={ICON_SIZE} /> {row.title}
          </Box>{' '}
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
            value={row.relation.quantity}
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
          {relationCost}
          <Tooltip
            title={
              <Typography>
                {row.quantity} {row.units} = ${row.cost}
                <br />
                {row.relation.quantity} {row.relation.units} = ${relationCost}
              </Typography>
            }
          >
            <span>
              <Icon name="info" />
            </span>
          </Tooltip>
        </TableCell>
        <TableCell align="right" sx={{ padding: `0 ${SPACING.TINY.PX}` }}>
          <Tooltip title={t('editIngredient')}>
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
                {t('ingredientDetails')}
              </Typography>
              <Table size="small" aria-label="ingredient details">
                <TableBody>
                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      {t('id')}
                    </TableCell>
                    <TableCell>{row.id}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      {t('quantity')}
                    </TableCell>
                    <TableCell>{row.quantity}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      {t('units')}
                    </TableCell>
                    <TableCell>
                      {t(row.units as keyof typeof ALL_UNITS)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      {t('created')}
                    </TableCell>
                    <TableCell>{formatDisplayDate(row.createdAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      {t('updated')}
                    </TableCell>
                    <TableCell>
                      {new Date(row.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell scope="row" sx={{ fontWeight: 'bold' }}>
                      {t('notes')}
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

export default IngredientRow
