import { Button } from '@mui/material'
import Box from '@mui/material/Box'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { useSignals } from '@preact/signals-react/runtime'
import * as React from 'react'
import { RECIPE_STATUS, RecipeDTO } from '../../../../shared/recipe.types'
import { ROWS_PER_PAGE } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal, activeRecipeIdSignal } from '../../../signals'
import Filters, { FilterOptions } from './Filters'
import Head from './Head'
import RecipeRow from './Row'

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator<Key extends keyof RecipeDTO | 'usedInRecipesCount'>(
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

const Table = ({
  recipes,
}: {
  recipes: (RecipeDTO & {
    usedInRecipesCount: number
  })[]
}) => {
  useSignals()
  const { t } = useAppTranslation()
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc')
  const [orderBy, setOrderBy] = React.useState<keyof RecipeDTO | 'usedInRecipesCount'>('createdAt')
  const [page, setPage] = React.useState(0)

  // Default filters: show draft and published, hide archived, show both in menu and not in menu
  const [filters, setFilters] = React.useState<FilterOptions>({
    status: [RECIPE_STATUS.draft, RECIPE_STATUS.published],
    filterToMenuItemsOnly: false,
  })

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof RecipeDTO | 'usedInRecipesCount',
  ) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setPage(0) // Reset to first page when filters change
  }

  // Apply filters to recipes
  const filteredRecipes = React.useMemo(() => {
    return recipes.filter(recipe => {
      // Filter by status
      const statusMatch = filters.status.includes(recipe.status)

      // Filter by if item is on the menu
      let menuItemsOnly = true
      if (filters.filterToMenuItemsOnly) {
        menuItemsOnly = recipe.showInMenu === true
      }

      return statusMatch && menuItemsOnly
    })
  }, [recipes, filters])

  const handleAddRecipe = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_RECIPE_MODAL,
    }
  }

  const handleOpenExportRecipesModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.EXPORT_RECIPES,
      recipes,
    }
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * ROWS_PER_PAGE - filteredRecipes.length)
      : 0

  const visibleRows = React.useMemo(
    () =>
      [...filteredRecipes]
        .sort(getComparator(order, orderBy))
        .slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [filteredRecipes, order, orderBy, page],
  )

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <Filters filters={filters} onFiltersChange={handleFiltersChange} />
      <TableContainer>
        <MuiTable
          sx={{ minWidth: 750, tableLayout: 'fixed' }}
          aria-labelledby="tableTitle"
          size="medium"
        >
          <Head
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {visibleRows.map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`

              return <RecipeRow key={row.id} row={row} labelId={labelId} />
            })}
            {emptyRows > 0 && (
              <TableRow
                style={{
                  height: 53 * emptyRows,
                }}
              >
                <TableCell colSpan={10} />
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={8}>
                <Button
                  size="small"
                  sx={activeRecipeIdSignal.value ? { opacity: 0.1 } : {}}
                  onClick={handleAddRecipe}
                  fullWidth
                  variant="outlined"
                >
                  {t('addRecipe')}
                </Button>
              </TableCell>
              <TableCell colSpan={2}>
                <Button
                  size="small"
                  sx={activeRecipeIdSignal.value ? { opacity: 0.1 } : {}}
                  onClick={handleOpenExportRecipesModal}
                  fullWidth
                  variant="outlined"
                >
                  Export PDF
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </MuiTable>
      </TableContainer>
      <TablePagination
        sx={activeRecipeIdSignal.value ? { opacity: 0.1 } : {}}
        size="small"
        component="div"
        count={filteredRecipes.length}
        rowsPerPage={ROWS_PER_PAGE}
        rowsPerPageOptions={[]}
        page={page}
        onPageChange={handleChangePage}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} ${t('outOf')} ${count}`
        }
      />
    </Box>
  )
}

export default Table
