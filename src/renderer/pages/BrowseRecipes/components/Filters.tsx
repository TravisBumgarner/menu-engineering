import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material'
import type React from 'react'
import { RECIPE_STATUS, type RecipeStatus } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { SPACING } from '../../../styles/consts'

export interface FilterOptions {
  status: RecipeStatus[]
  filterToMenuItemsOnly: boolean
  showSubRecipes: boolean
  showMainRecipes: boolean
}

interface FiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

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

  const handleSubRecipesChange = (_event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
    onFiltersChange({
      ...filters,
      showSubRecipes: checked,
    })
  }

  const handleMainRecipesChange = (_event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
    onFiltersChange({
      ...filters,
      showMainRecipes: checked,
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'flex-end',
        padding: SPACING.SMALL.PX,
        alignItems: 'center',
      }}
    >
      <FormControl size="small">
        <InputLabel>{t('status')}</InputLabel>
        <Select
          multiple
          value={filters.status}
          onChange={handleStatusChange}
          label={t('status')}
          renderValue={(selected) => selected.map((status) => t(status as keyof typeof RECIPE_STATUS)).join(', ')}
        >
          <MenuItem value={RECIPE_STATUS.draft}>{t('draft')}</MenuItem>
          <MenuItem value={RECIPE_STATUS.published}>{t('published')}</MenuItem>
          <MenuItem value={RECIPE_STATUS.archived}>{t('archived')}</MenuItem>
        </Select>
      </FormControl>

      <Divider orientation="vertical" flexItem />

      <FormControl size="small">
        <FormGroup>
          <FormControlLabel
            onChange={handleShowInMenuChange}
            control={<Checkbox checked={filters.filterToMenuItemsOnly} />}
            label={t('filterToMenuItems')}
          />
        </FormGroup>
      </FormControl>

      <Divider orientation="vertical" flexItem />

      <FormControl size="small">
        <FormGroup>
          <FormControlLabel
            onChange={handleSubRecipesChange}
            control={<Checkbox checked={filters.showSubRecipes} />}
            label={t('subRecipes')}
          />
        </FormGroup>
      </FormControl>

      <FormControl size="small">
        <FormGroup>
          <FormControlLabel
            onChange={handleMainRecipesChange}
            control={<Checkbox checked={filters.showMainRecipes} />}
            label={t('mainRecipes')}
          />
        </FormGroup>
      </FormControl>
    </Box>
  )
}

export default Filters
