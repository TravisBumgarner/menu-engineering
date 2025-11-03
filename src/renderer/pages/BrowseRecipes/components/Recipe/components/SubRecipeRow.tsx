import { Tooltip } from '@mui/material'
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
import { RecipeDTO } from '../../../../../../shared/recipe.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import Icon from '../../../../../sharedComponents/Icon'
import { activeModalSignal } from '../../../../../signals'
import { ICON_SIZE } from './consts'

function SubRecipeRow(props: {
  row: RecipeDTO
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
          queryKey: [QUERY_KEYS.RECIPE, recipeId],
        })
        alert('Ingredient removed from recipe successfully!')
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
      id: 'EDIT_RECIPE_MODAL',
      recipe: row,
    }
  }

  const handleOpenRemoveModal = () => {
    activeModalSignal.value = {
      id: 'CONFIRMATION_MODAL',
      title: 'Remove Ingredient',
      body: `Are you sure you want to remove the sub recipe "${row.title}" from this recipe? This action cannot be undone.`,
      confirmationCallback: () => {
        removeIngredientMutation.mutate()
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
        <TableCell component="th" id={labelId} scope="row" padding="none">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon name="recipe" size={ICON_SIZE} /> {row.title}
          </Box>
        </TableCell>
        <TableCell
          align="right"
          component="th"
          id={labelId}
          scope="row"
          padding="none"
        >
          0.00
        </TableCell>
        <TableCell align="center">
          <Tooltip title="Edit Ingredient">
            <IconButton onClick={handleOpenEditModal}>
              <Icon name="edit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove from Recipe">
            <IconButton onClick={handleOpenRemoveModal}>
              <Icon name="close" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                {t('recipeDetails')}
              </Typography>
              <Table size="small" aria-label="ingredient details">
                <TableBody>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      ID
                    </TableCell>
                    <TableCell>{row.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      Created
                    </TableCell>
                    <TableCell>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      Updated
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
                      Produces
                    </TableCell>
                    <TableCell>
                      {row.produces} - {row.units}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      Notes
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

export default SubRecipeRow
