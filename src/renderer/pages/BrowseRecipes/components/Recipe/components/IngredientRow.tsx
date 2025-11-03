import { TextField, Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
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
import { ALL_UNITS, AllUnits } from '../../../../../../shared/units.types'
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
  const [open, setOpen] = React.useState(false)
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
          queryKey: [QUERY_KEYS.RECIPE],
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
          queryKey: [QUERY_KEYS.RECIPE],
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
    // Function currently assumes row units are the same.

    // row.cost
    // row.units
    // row.quantity

    // row.relation.quantity
    // row.relation.units

    return row.relation.quantity * (row.cost / row.quantity)
  }, [row.cost, row.quantity, row.relation.quantity])

  // const handleUnitsChange = (event: { target: { value: string } }) => {
  //   const newUnits = event.target.value
  //   updateIngredientRelationMutation.mutate({ units: newUnits })
  // }

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
        <TableCell>
          <IconButton
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
          </IconButton>
        </TableCell>
        <TableCell padding="none">{formatDisplayDate(row.createdAt)}</TableCell>
        <TableCell component="th" id={labelId} scope="row" padding="none">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon name="ingredient" size={ICON_SIZE} /> {row.title}
          </Box>{' '}
        </TableCell>
        <TableCell
          align="right"
          component="th"
          id={labelId}
          scope="row"
          padding="none"
        >
          <TextField
            size="small"
            type="number"
            value={row.relation.quantity}
            onChange={handleQuantityChange}
            variant="outlined"
          />
        </TableCell>
        <TableCell
          align="left"
          component="th"
          id={labelId}
          scope="row"
          padding="none"
        >
          {row.units}
          {/* <FormControl size="small" sx={{ width: 120 }} required>
            <Select
              value={row.relation.units}
              onChange={e => handleUnitsChange(e)}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="" disabled>
                {t('units')}
              </MenuItem>
              {Object.entries(ALL_UNITS).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {t(value as keyof typeof ALL_UNITS)}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
        </TableCell>
        <TableCell
          align="right"
          component="th"
          id={labelId}
          scope="row"
          padding="none"
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
        <TableCell align="center">
          <Box
            sx={{
              display: 'flex',
              gap: SPACING.TINY.PX,
              justifyContent: 'center',
            }}
          >
            <Tooltip title={t('editIngredient')}>
              <IconButton onClick={handleOpenEditModal}>
                <Icon name="edit" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('removeIngredientFromRecipe')}>
              <IconButton onClick={handleOpenRemoveModal}>
                <Icon name="close" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                {t('ingredientDetails')}
              </Typography>
              <Table size="small" aria-label="ingredient details">
                <TableBody>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('id')}
                    </TableCell>
                    <TableCell>{row.id}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('quantity')}
                    </TableCell>
                    <TableCell>{row.quantity}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('units')}
                    </TableCell>
                    <TableCell>
                      {t(row.units as keyof typeof ALL_UNITS)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('created')}
                    </TableCell>
                    <TableCell>{formatDisplayDate(row.createdAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('updated')}
                    </TableCell>
                    <TableCell>
                      {new Date(row.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('notes')}
                    </TableCell>
                    <TableCell>{row.notes || <em>No notes</em>}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default IngredientRow
