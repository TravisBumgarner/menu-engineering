import { Box, InputAdornment, TextField } from '@mui/material'
import type React from 'react'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'
import { SPACING } from '../../../styles/consts'

export interface FilterOptions {
  searchQuery: string
}

interface FiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

const Filters: React.FC<FiltersProps> = ({ filters, onFiltersChange }) => {
  const { t } = useAppTranslation()

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: event.target.value,
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: SPACING.SMALL.PX,
      }}
    >
      <TextField
        size="small"
        placeholder={t('searchIngredients')}
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
    </Box>
  )
}

export default Filters
