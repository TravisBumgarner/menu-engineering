import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import {
  NewRecipeDTO,
  RECIPE_STATUS,
  RecipeDTO,
} from '../../../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../../../shared/units.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import { SPACING } from '../../../../../styles/consts'
import { ADD_ROW_HEIGHT } from './consts'

interface AddSubRecipeRowProps {
  parentRecipe: RecipeDTO
  onCancel: () => void
}

const AddSubRecipeRow: React.FC<AddSubRecipeRowProps> = ({
  parentRecipe,
  onCancel,
}) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<NewRecipeDTO>({
    title: '',
    produces: 0,
    units: '',
    status: RECIPE_STATUS.draft,
    notes: '',
    showInMenu: false,
  })

  const addSubRecipeMutation = useMutation({
    mutationFn: (recipeData: NewRecipeDTO) =>
      ipcMessenger.invoke(CHANNEL.DB.ADD_SUB_RECIPE, {
        payload: {
          newRecipe: recipeData,
          parentRecipeId: parentRecipe.id,
        },
      }),
    onSuccess: result => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        onCancel()
      } else {
        alert(t('failedToAddSubRecipe'))
      }
    },
    onError: () => {
      alert(t('errorAddingSubRecipe'))
    },
  })

  const handleSubmit = () => {
    addSubRecipeMutation.mutate(formData)
  }

  const handleInputChange =
    (field: keyof NewRecipeDTO) =>
    (
      e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } },
    ) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const preventSubmit =
    addSubRecipeMutation.isPending ||
    !formData.title.trim() ||
    !formData.units.trim() ||
    formData.produces <= 0

  return (
    <TableRow sx={{ height: ADD_ROW_HEIGHT }}>
      <TableCell colSpan={6}>
        <Box
          sx={{
            display: 'flex',
            gap: SPACING.MEDIUM.PX,
            alignItems: 'center',
            width: '100%',
          }}
        >
          <TextField
            size="small"
            label={t('recipeName')}
            value={formData.title}
            onChange={handleInputChange('title')}
            required
            sx={{ flex: 2 }}
            variant="outlined"
          />

          <TextField
            size="small"
            label={t('produces')}
            type="number"
            value={formData.produces}
            onChange={handleInputChange('produces')}
            required
            sx={{ width: 100 }}
            variant="outlined"
            inputProps={{ min: 0, step: 'any' }}
          />

          <FormControl size="small" sx={{ width: 120 }} required>
            <Select
              value={formData.units}
              onChange={e =>
                handleInputChange('units')(
                  e as React.ChangeEvent<HTMLInputElement>,
                )
              }
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="" disabled>
                {t('units')}
              </MenuItem>
              {Object.entries(ALL_UNITS).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {t(value as keyof typeof ALL_UNITS)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 120 }} required>
            <Select
              value={formData.status}
              onChange={handleInputChange('status')}
              variant="outlined"
            >
              <MenuItem value={RECIPE_STATUS.draft}>{t('draft')}</MenuItem>
              <MenuItem value={RECIPE_STATUS.published}>
                {t('published')}
              </MenuItem>
              <MenuItem value={RECIPE_STATUS.archived}>
                {t('archived')}
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label={t('notes')}
            value={formData.notes}
            onChange={handleInputChange('notes')}
            sx={{ flex: 1 }}
            variant="outlined"
            multiline
            rows={1}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onCancel} variant="outlined" size="small">
              {t('cancel')}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmit}
              disabled={preventSubmit}
            >
              {addSubRecipeMutation.isPending ? t('adding') : t('save')}
            </Button>
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  )
}

export default AddSubRecipeRow
