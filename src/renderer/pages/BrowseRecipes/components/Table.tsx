import { Button, Stack } from '@mui/material'
import Box from '@mui/material/Box'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { RECIPE_STATUS, type RecipeDTO } from '../../../../shared/recipe.types'
import { PAGINATION, QUERY_KEYS } from '../../../consts'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../signals'
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
): (
  a: RecipeDTO & { usedInRecipesCount: number; hasZeroQuantity: boolean },
  b: RecipeDTO & { usedInRecipesCount: number; hasZeroQuantity: boolean },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

const Table = ({
  recipes,
}: {
  recipes: (RecipeDTO & {
    categoryIds: string[]
    usedInRecipesCount: number
    hasZeroQuantity: boolean
  })[]
}) => {
  const { t } = useAppTranslation()

  const { data: categoriesData } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_CATEGORIES, undefined),
  })
  const categories = categoriesData?.categories ?? []

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
    categoryId: null,
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

      // Filter by category
      let categoryMatch = true
      if (filters.categoryId === 'uncategorized') {
        categoryMatch = !recipe.categoryIds || recipe.categoryIds.length === 0
      } else if (filters.categoryId) {
        categoryMatch = recipe.categoryIds?.includes(filters.categoryId) ?? false
      }

      return searchMatch && statusMatch && menuItemsOnly && recipeTypeMatch && categoryMatch
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
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {categories.length > 0 && (
        <Box sx={{ display: 'flex', gap: SPACING.XXS.PX, flexWrap: 'wrap', pt: SPACING.XS.PX, flexShrink: 0 }}>
          <Button
            size="small"
            variant={filters.categoryId === null ? 'contained' : 'outlined'}
            onClick={() => handleFiltersChange({ ...filters, categoryId: null })}
          >
            {t('allCategories')}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="small"
              variant={filters.categoryId === cat.id ? 'contained' : 'outlined'}
              onClick={() => handleFiltersChange({ ...filters, categoryId: cat.id })}
            >
              {cat.title}
            </Button>
          ))}
          <Button
            size="small"
            variant={filters.categoryId === 'uncategorized' ? 'contained' : 'outlined'}
            onClick={() => handleFiltersChange({ ...filters, categoryId: 'uncategorized' })}
          >
            {t('uncategorized')}
          </Button>
        </Box>
      )}
      <Box sx={{ paddingY: SPACING.XS.PX, flexShrink: 0 }}>
        <Filters filters={filters} onFiltersChange={handleFiltersChange} />
      </Box>
      <TableContainer sx={{ boxShadow: 'none', flex: 1, overflow: 'auto' }}>
        <MuiTable sx={{ tableLayout: 'fixed' }} aria-labelledby="tableTitle" size="small">
          <Head order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
          <TableBody>
            {visibleRows.map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`

              return <RecipeRow key={row.id} row={row} labelId={labelId} />
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>
      <Box sx={{ flexShrink: 0, py: SPACING.XS.PX }}>
        <Button size="small" onClick={handleAddRecipe} fullWidth variant="outlined">
          {t('addRecipe')}
        </Button>
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0 }}>
        <Button size="small" onClick={handleOpenExportRecipesModal} variant="outlined">
          Export PDF
        </Button>
        <TablePagination
          rowsPerPageOptions={PAGINATION.ROWS_PER_PAGE_OPTIONS}
          onRowsPerPageChange={handleChangeRowsPerPage}
          size="small"
          component="div"
          count={filteredRecipes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} ${t('outOf')} ${count}`}
        />
      </Stack>
    </Box>
  )
}

export default Table
