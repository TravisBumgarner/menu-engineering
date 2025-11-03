import Box from '@mui/material/Box'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import * as React from 'react'
import { IngredientDTO, RecipeDTO } from '../../../../../../shared/recipe.types'
import { ROWS_PER_PAGE } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import AddRow from './AddRow'
import { SORTABLE_OPTIONS } from './consts'
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
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc')
  const [orderBy, setOrderBy] = React.useState<'title'>('title')
  const [page, setPage] = React.useState(0)
  const { t } = useAppTranslation()

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof typeof SORTABLE_OPTIONS,
  ) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
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
    [ingredients, subRecipes, order, orderBy, page],
  )

  return (
    <Box sx={{ width: '100%', tableLayout: 'fixed' }}>
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

            <AddRow recipe={recipe} />
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
    </Box>
  )
}

export default Table
