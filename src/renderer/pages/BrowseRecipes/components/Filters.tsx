import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import React from 'react'
import { RECIPE_STATUS, RecipeStatus } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'

export interface FilterOptions {
  status: RecipeStatus[]
  showInMenu: 'all' | 'yes' | 'no'
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

  const handleShowInMenuChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as 'all' | 'yes' | 'no'
    onFiltersChange({
      ...filters,
      showInMenu: value,
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        padding: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        marginBottom: 2,
      }}
    >
      <Typography variant="h6" component="h2" sx={{ marginRight: 2 }}>
        {t('filters')}:
      </Typography>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>{t('status')}</InputLabel>
        <Select
          multiple
          value={filters.status}
          onChange={handleStatusChange}
          label={t('status')}
          renderValue={selected =>
            selected
              .map(status => t(status as keyof typeof RECIPE_STATUS))
              .join(', ')
          }
        >
          <MenuItem value={RECIPE_STATUS.draft}>{t('draft')}</MenuItem>
          <MenuItem value={RECIPE_STATUS.published}>{t('published')}</MenuItem>
          <MenuItem value={RECIPE_STATUS.archived}>{t('archived')}</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>{t('showInMenu')}</InputLabel>
        <Select
          value={filters.showInMenu}
          onChange={handleShowInMenuChange}
          label={t('showInMenu')}
        >
          <MenuItem value="all">{t('all')}</MenuItem>
          <MenuItem value="yes">{t('yes')}</MenuItem>
          <MenuItem value="no">{t('no')}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default Filters
