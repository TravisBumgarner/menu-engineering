import { Button, Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { IngredientDTO, RecipeDTO } from '../../../../shared/recipe.types'
import { QUERY_KEYS, ROWS_PER_PAGE } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import Icon from '../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../signals'
import Autocomplete from './Autocomplete'
import { SORTABLE_OPTIONS } from './consts'
import EnhancedTableHead from './Head'
import IngredientRow from './IngredientRow'
import SubRecipeRow from './SubRecipeRow'
import EnhancedTableToolbar from './Toolbar'

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator<Key extends keyof IngredientDTO>(
  order: 'asc' | 'desc',
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

const Table = ({
  ingredients,
  subRecipes,
  recipe,
}: {
  ingredients: IngredientDTO[]
  subRecipes: RecipeDTO[]
  recipe: RecipeDTO
}) => {
  const queryClient = useQueryClient()
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc')
  const [orderBy, setOrderBy] = React.useState<'title'>('title')
  const [page, setPage] = React.useState(0)
  const { t } = useAppTranslation()

  const [selectedAutocomplete, setSelectedAutocomplete] = React.useState<{
    label: string
    id: string
    type: 'ingredient' | 'recipe'
  } | null>(null)

  const {
    isPending: addExistingToRecipeIsLoading,
    mutate: addExistingToRecipe,
  } = useMutation({
    mutationFn: async () => {
      if (!selectedAutocomplete) return
      await ipcMessenger.invoke(CHANNEL.DB.ADD_EXISTING_TO_RECIPE, {
        childId: selectedAutocomplete.id,
        parentId: recipe.id,
        type: selectedAutocomplete.type,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
      setSelectedAutocomplete(null)
    },
  })

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof typeof SORTABLE_OPTIONS,
  ) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleOpenAddIngredientModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_INGREDIENT_MODAL,
      recipe,
    }
  }

  const handleOpenAddRecipeModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_RECIPE_MODAL,
      parentRecipe: recipe,
    }
  }

  const handleAutocompleteSelect = (
    value: {
      label: string
      id: string
      type: 'ingredient' | 'recipe'
    } | null,
  ) => {
    setSelectedAutocomplete(value)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * ROWS_PER_PAGE - ingredients.length) : 0

  const visibleRows = React.useMemo(
    () =>
      [
        ...ingredients.map(i => ({ ...i, type: 'ingredient' as const })),
        ...subRecipes.map(s => ({ ...s, type: 'sub-recipe' as const })),
      ]
        .sort(getComparator(order, orderBy))
        .slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [ingredients, order, orderBy, page, ROWS_PER_PAGE],
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar recipe={recipe} />
        <TableContainer>
          <MuiTable
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`

                if (row.type === 'sub-recipe') {
                  return (
                    <SubRecipeRow
                      key={row.id}
                      row={row}
                      recipeId={row.id}
                      labelId={labelId}
                    />
                  )
                }

                return (
                  <IngredientRow
                    key={row.id}
                    row={row}
                    recipeId={recipe.id}
                    labelId={labelId}
                  />
                )
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={7} />
                </TableRow>
              )}

              <TableRow>
                <TableCell colSpan={6} sx={{ backgroundColor: '#f9f9f9' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <Autocomplete handleOnChange={handleAutocompleteSelect} />
                    <Button
                      variant="outlined"
                      disabled={
                        !selectedAutocomplete || addExistingToRecipeIsLoading
                      }
                      onClick={() => addExistingToRecipe()}
                    >
                      {addExistingToRecipeIsLoading ? t('adding') : t('add')}
                    </Button>
                    <Tooltip title={t('addIngredient')}>
                      <Button onClick={handleOpenAddIngredientModal}>
                        <Icon name="add" /> {t('ingredient')}
                      </Button>
                    </Tooltip>
                    <Tooltip title={t('addRecipe')}>
                      <Button onClick={handleOpenAddRecipeModal}>
                        <Icon name="add" /> {t('recipe')}
                      </Button>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          component="div"
          count={ingredients.length}
          page={page}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[]}
          onPageChange={handleChangePage}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} ${t('outOf')} ${count}`
          }
        />
      </Paper>
    </Box>
  )
}

export default Table
