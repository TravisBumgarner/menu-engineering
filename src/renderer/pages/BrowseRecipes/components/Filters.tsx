import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  ListItemText,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SxProps,
  TextField,
} from '@mui/material'
import type React from 'react'
import { RECIPE_STATUS, type RecipeStatus } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'
import { SPACING } from '../../../styles/consts'

export interface FilterOptions {
  status: RecipeStatus[]
  filterToMenuItemsOnly: boolean
  showSubRecipes: boolean
  showMainRecipes: boolean
  searchQuery: string
  categoryId: string | null // null = all, 'uncategorized' = no category, otherwise category id
}

interface FiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

const STATUS_OPTIONS: RecipeStatus[] = [RECIPE_STATUS.draft, RECIPE_STATUS.published, RECIPE_STATUS.archived]

type RecipeTypeValue = 'all' | 'sub' | 'main'

const Filters: React.FC<FiltersProps> = ({ filters, onFiltersChange }) => {
  const { t } = useAppTranslation()

  const handleStatusChange = (event: SelectChangeEvent<RecipeStatus[]>) => {
    const value = event.target.value as RecipeStatus[]
    onFiltersChange({
      ...filters,
      status: value,
    })
  }

  const handleShowInMenuChange = (_event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
    onFiltersChange({
      ...filters,
      filterToMenuItemsOnly: checked,
    })
  }

  const recipeTypeValue: RecipeTypeValue =
    filters.showSubRecipes && filters.showMainRecipes
      ? 'all'
      : filters.showSubRecipes
        ? 'sub'
        : filters.showMainRecipes
          ? 'main'
          : 'all'

  const handleRecipeTypeChange = (event: SelectChangeEvent<RecipeTypeValue>) => {
    const value = event.target.value as RecipeTypeValue
    onFiltersChange({
      ...filters,
      showSubRecipes: value === 'all' || value === 'sub',
      showMainRecipes: value === 'all' || value === 'main',
    })
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: event.target.value,
    })
  }

  const statusLabel = (status: RecipeStatus) => {
    switch (status) {
      case RECIPE_STATUS.draft:
        return t('draft')
      case RECIPE_STATUS.published:
        return t('published')
      case RECIPE_STATUS.archived:
        return t('archived')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.XS.PX,
      }}
    >
      <TextField
        size="small"
        placeholder={t('searchRecipes')}
        value={filters.searchQuery}
        onChange={handleSearchChange}
        variant="outlined"
        sx={{ minWidth: 200 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Icon name="search" size={18} />
              </InputAdornment>
            ),
          },
        }}
      />

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          multiple
          value={filters.status}
          onChange={handleStatusChange}
          displayEmpty
          renderValue={(selected) => {
            if (selected.length === 0) return t('status')
            return selected.map((s) => statusLabel(s)).join(', ')
          }}
        >
          {STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              <Checkbox size="small" checked={filters.status.includes(status)} />
              <ListItemText primary={statusLabel(status)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select value={recipeTypeValue} onChange={handleRecipeTypeChange}>
          <MenuItem value="all">{t('allRecipes')}</MenuItem>
          <MenuItem value="sub">{t('subRecipes')}</MenuItem>
          <MenuItem value="main">{t('mainRecipes')}</MenuItem>
        </Select>
      </FormControl>

      <Divider orientation="vertical" flexItem />

      <FormControl size="small">
        <FormGroup>
          <FormControlLabel
            sx={formControlLabelSX}
            onChange={handleShowInMenuChange}
            control={<Checkbox sx={checkboxSX} size="small" checked={filters.filterToMenuItemsOnly} />}
            label={t('filterToMenuItems')}
            slotProps={{ typography: { variant: 'body2' } }}
          />
        </FormGroup>
      </FormControl>
    </Box>
  )
}

const formControlLabelSX: SxProps = {
  p: `0 ${SPACING.TINY.PX}`,
  margin: 0,
}

const checkboxSX: SxProps = {
  padding: `0 0 0 0`,
  marginRight: SPACING.TINY.PX,
}

export default Filters
