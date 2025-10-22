import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import * as React from 'react'
import { RecipeDTO } from '../../../../shared/recipe.types'
import { ROWS_PER_PAGE } from '../../../consts'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../signals'
import EnhancedTableHead from './Head'
import RecipeRow from './Row'
import EnhancedTableToolbar from './Toolbar'
import { useAppTranslation } from '../../../hooks/useTranslation'

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator<Key extends keyof RecipeDTO>(
  order: 'asc' | 'desc',
  orderBy: Key,
): (
  a: { [key in Key]: number | string | boolean },
  b: { [key in Key]: number | string | boolean },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

const Table = ({ recipes }: { recipes: RecipeDTO[] }) => {
  const { t } = useAppTranslation()
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc')
  const [orderBy, setOrderBy] = React.useState<keyof RecipeDTO>('title')
  const [selected, setSelected] = React.useState<readonly string[]>([])
  const [page, setPage] = React.useState(0)

  const handleOpenAddRecipeModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_RECIPE_MODAL,
    }
  }

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof RecipeDTO,
  ) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = recipes.map(n => n.id)
      setSelected(newSelected)
      return
    }
    setSelected([])
  }

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected: readonly string[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }
    setSelected(newSelected)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * ROWS_PER_PAGE - recipes.length) : 0

  const visibleRows = React.useMemo(
    () =>
      [...recipes]
        .sort(getComparator(order, orderBy))
        .slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [recipes, order, orderBy, page, ROWS_PER_PAGE],
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          onAddRecipe={handleOpenAddRecipeModal}
        />
        <TableContainer>
          <MuiTable
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={recipes.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.id)
                const labelId = `enhanced-table-checkbox-${index}`

                return (
                  <RecipeRow
                    key={row.id}
                    row={row}
                    isItemSelected={isItemSelected}
                    labelId={labelId}
                    onClick={handleClick}
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
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          component="div"
          count={recipes.length}
          rowsPerPage={15}
          rowsPerPageOptions={[]}
          page={page}
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
