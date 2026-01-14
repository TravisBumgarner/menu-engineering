import { Button } from '@mui/material'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import * as React from 'react'
import type { IngredientDTO } from '../../../../shared/recipe.types'
import { PAGINATION } from '../../../consts'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import EnhancedTableHead from './Head'
import IngredientRow from './Row'

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator<Key extends keyof IngredientDTO | 'recipeCount'>(
  order: 'asc' | 'desc',
  orderBy: Key,
): (a: IngredientDTO & { recipeCount: number }, b: IngredientDTO & { recipeCount: number }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy as keyof (IngredientDTO & { recipeCount: number }))
    : (a, b) => -descendingComparator(a, b, orderBy as keyof (IngredientDTO & { recipeCount: number }))
}

const Table = ({
  ingredients,
}: {
  ingredients: (IngredientDTO & {
    recipeCount: number
  })[]
}) => {
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc')
  const [orderBy, setOrderBy] = React.useState<keyof IngredientDTO | 'recipeCount'>('createdAt')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = useLocalStorage('browseIngredientsPagination', PAGINATION.DEFAULT_ROWS_PER_PAGE)

  const { t } = useAppTranslation()

  const handleOpenAddIngredientModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_INGREDIENT_MODAL,
    }
  }

  const handleOpenExportIngredientsModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.EXPORT_INGREDIENTS,
      ingredients,
    }
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof IngredientDTO | 'recipeCount') => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - ingredients.length) : 0

  const visibleRows = React.useMemo(
    () =>
      [...ingredients].sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [ingredients, order, orderBy, page, rowsPerPage],
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <MuiTable sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`

                return <IngredientRow key={row.id} row={row} labelId={labelId} />
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={8} />
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={8} sx={{ padding: SPACING.MEDIUM.PX }}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: SPACING.MEDIUM.PX,
                    }}
                  >
                    <Button size="small" onClick={handleOpenAddIngredientModal} fullWidth variant="outlined">
                      {t('addIngredient')}
                    </Button>
                    <Button size="small" onClick={handleOpenExportIngredientsModal} fullWidth variant="outlined">
                      Export CSV
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={PAGINATION.ROWS_PER_PAGE_OPTIONS}
          component="div"
          count={ingredients.length}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} ${t('outOf')} ${count}`}
        />
      </Paper>
    </Box>
  )
}

export default Table
