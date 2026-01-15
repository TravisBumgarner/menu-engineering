import { Box, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, type SxProps } from '@mui/material'
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

  const handleStatusChange =
    (statusValue: RecipeStatus) => (_event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
      const newStatus = checked ? [...filters.status, statusValue] : filters.status.filter((s) => s !== statusValue)

      onFiltersChange({
        ...filters,
        status: newStatus,
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: SPACING.SMALL.PX,
      }}
    >
      <FormControl size="small">
        <FormGroup row>
          <FormControlLabel
            sx={formControlLabelSX}
            onChange={handleStatusChange(RECIPE_STATUS.draft)}
            control={<Checkbox sx={checkboxSX} size="small" checked={filters.status.includes(RECIPE_STATUS.draft)} />}
            label={t('draft')}
            slotProps={{ typography: { variant: 'body2' } }}
          />
          <FormControlLabel
            sx={formControlLabelSX}
            onChange={handleStatusChange(RECIPE_STATUS.published)}
            control={
              <Checkbox sx={checkboxSX} size="small" checked={filters.status.includes(RECIPE_STATUS.published)} />
            }
            label={t('published')}
            slotProps={{ typography: { variant: 'body2' } }}
          />
          <FormControlLabel
            sx={formControlLabelSX}
            onChange={handleStatusChange(RECIPE_STATUS.archived)}
            control={
              <Checkbox sx={checkboxSX} size="small" checked={filters.status.includes(RECIPE_STATUS.archived)} />
            }
            label={t('archived')}
            slotProps={{ typography: { variant: 'body2' } }}
          />
        </FormGroup>
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

      <Divider orientation="vertical" flexItem />

      <FormControl size="small">
        <FormGroup row>
          <FormControlLabel
            sx={formControlLabelSX}
            onChange={handleSubRecipesChange}
            control={<Checkbox sx={checkboxSX} size="small" checked={filters.showSubRecipes} />}
            label={t('subRecipes')}
            slotProps={{ typography: { variant: 'body2' } }}
          />

          <FormControlLabel
            sx={formControlLabelSX}
            onChange={handleMainRecipesChange}
            control={<Checkbox sx={checkboxSX} size="small" checked={filters.showMainRecipes} />}
            label={t('mainRecipes')}
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
