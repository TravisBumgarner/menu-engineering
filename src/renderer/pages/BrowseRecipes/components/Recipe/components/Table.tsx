import { Button } from '@mui/material'
import Box from '@mui/material/Box'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import * as React from 'react'
import type { IngredientDTO, RecipeDTO, RelationDTO } from '../../../../../../shared/recipe.types'
import { PAGINATION } from '../../../../../consts'
import { useLocalStorage } from '../../../../../hooks/useLocalStorage'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import Icon from '../../../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../../../signals'
import { LOCAL_STORAGE_KEYS } from '../../../../../utilities'
import type { SORTABLE_OPTIONS } from './consts'
import EnhancedTableHead from './Head'
import IngredientRow from './IngredientRow'
import SubRecipeRow from './SubRecipeRow'

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
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

const Table = ({
  ingredients,
  subRecipes,
  recipe,
}: {
  ingredients: (IngredientDTO & { relation: RelationDTO })[]
  subRecipes: (RecipeDTO & { relation: RelationDTO })[]
  recipe: RecipeDTO
}) => {
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc')
  const [orderBy, setOrderBy] = React.useState<'title' | 'createdAt'>('createdAt')
  const [page, setPage] = React.useState(0)
  const { t } = useAppTranslation()
  const [rowsPerPage, setRowsPerPage] = useLocalStorage(
    LOCAL_STORAGE_KEYS.RECIPE_DETAILS_PAGINATION,
    PAGINATION.DEFAULT_ROWS_PER_PAGE,
  )

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof typeof SORTABLE_OPTIONS) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - ingredients.length) : 0

  const visibleRows = React.useMemo(
    () =>
      [
        ...ingredients.map((i) => ({ ...i, type: 'ingredient' as const })),
        ...subRecipes.map((s) => ({ ...s, type: 'sub-recipe' as const })),
      ]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [ingredients, subRecipes, order, orderBy, page, rowsPerPage],
  )

  const handleAddToRecipe = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_TO_RECIPE_MODAL,
      recipe,
    }
  }

  return (
    <Box sx={{ width: '100%', tableLayout: 'fixed' }}>
      <TableContainer sx={{ boxShadow: 'none' }}>
        <MuiTable sx={{ tableLayout: 'fixed' }} aria-labelledby="tableTitle" size="medium">
          <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
          <TableBody>
            {visibleRows.map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`

              if (row.type === 'sub-recipe') {
                return <SubRecipeRow key={row.id} row={row} recipeId={recipe.id} labelId={labelId} />
              }

              return <IngredientRow key={row.id} row={row} recipeId={recipe.id} labelId={labelId} />
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
              <TableCell colSpan={8}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  onClick={handleAddToRecipe}
                  startIcon={<Icon name="add" />}
                >
                  {t('addToRecipe')}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </MuiTable>
      </TableContainer>
      <TablePagination
        size="small"
        component="div"
        count={ingredients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        rowsPerPageOptions={PAGINATION.ROWS_PER_PAGE_OPTIONS}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} ${t('outOf')} ${count}`}
      />
    </Box>
  )
}

export default Table
