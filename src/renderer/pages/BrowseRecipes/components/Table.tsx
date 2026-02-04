import { Button, Stack } from '@mui/material'
import Box from '@mui/material/Box'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { useSignals } from '@preact/signals-react/runtime'
import * as React from 'react'
import { RECIPE_STATUS, type RecipeDTO } from '../../../../shared/recipe.types'
import { PAGINATION } from '../../../consts'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal, activeRecipeIdSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { LOCAL_STORAGE_KEYS } from '../../../utilities'
import Filters, { type FilterOptions } from './Filters'
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
): (a: RecipeDTO & { usedInRecipesCount: number }, b: RecipeDTO & { usedInRecipesCount: number }) => number {
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
  const [rowsPerPage, setRowsPerPage] = useLocalStorage(
    LOCAL_STORAGE_KEYS.BROWSE_RECIPES_PAGINATION,
    PAGINATION.DEFAULT_ROWS_PER_PAGE,
  )

  // Default filters: show draft and published, hide archived, show both in menu and not in menu
  const [filters, setFilters] = React.useState<FilterOptions>({
    status: [RECIPE_STATUS.draft, RECIPE_STATUS.published],
    filterToMenuItemsOnly: false,
    showSubRecipes: true,
    showMainRecipes: true,
    searchQuery: '',
  })

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof RecipeDTO | 'usedInRecipesCount') => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setPage(0) // Reset to first page when filters change
  }

  // Apply filters to recipes
  const filteredRecipes = React.useMemo(() => {
    return recipes.filter((recipe) => {
      // Filter by search query
      const searchMatch =
        filters.searchQuery === '' || recipe.title.toLowerCase().includes(filters.searchQuery.toLowerCase())

      // Filter by status
      const statusMatch = filters.status.includes(recipe.status)

      // Filter by if item is on the menu
      let menuItemsOnly = true
      if (filters.filterToMenuItemsOnly) {
        menuItemsOnly = recipe.showInMenu === true
      }

      // Filter by sub recipes vs main recipes
      const isSubRecipe = recipe.usedInRecipesCount > 0
      const isMainRecipe = recipe.usedInRecipesCount === 0

      let recipeTypeMatch = false
      if (filters.showSubRecipes && filters.showMainRecipes) {
        recipeTypeMatch = true
      } else if (filters.showSubRecipes) {
        recipeTypeMatch = isSubRecipe
      } else if (filters.showMainRecipes) {
        recipeTypeMatch = isMainRecipe
      }

      return searchMatch && statusMatch && menuItemsOnly && recipeTypeMatch
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
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRecipes.length) : 0

  const visibleRows = React.useMemo(
    () =>
      [...filteredRecipes]
        // This isn't actually a bug. I need to overhaul this function at some point.
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRecipes, order, orderBy, page, rowsPerPage],
  )

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignContent="center"
        sx={{ paddingY: SPACING.SMALL.PX, ...(activeRecipeIdSignal.value ? { opacity: 0.1 } : {}) }}
      >
        <Filters filters={filters} onFiltersChange={handleFiltersChange} />

        <Box>
          <Button size="small" onClick={handleOpenExportRecipesModal} variant="outlined">
            Export PDF
          </Button>
        </Box>
      </Stack>
      <TableContainer sx={{ boxShadow: 'none' }}>
        <MuiTable sx={{ tableLayout: 'fixed' }} aria-labelledby="tableTitle" size="small">
          <Head
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            sx={activeRecipeIdSignal.value ? { opacity: 0.1 } : {}}
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
                <TableCell colSpan={9} />
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={9}>
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
            </TableRow>
          </TableBody>
        </MuiTable>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={PAGINATION.ROWS_PER_PAGE_OPTIONS}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={activeRecipeIdSignal.value ? { opacity: 0.1 } : {}}
        size="small"
        component="div"
        count={filteredRecipes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} ${t('outOf')} ${count}`}
      />
    </Box>
  )
}

export default Table
