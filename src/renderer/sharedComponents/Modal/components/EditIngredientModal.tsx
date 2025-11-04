import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import {
  IngredientDTO,
  NewIngredientDTO,
} from '../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../shared/units.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface EditIngredientModalProps {
  id: typeof MODAL_ID.EDIT_INGREDIENT_MODAL
  ingredient: IngredientDTO
  recipeId?: string
  recipeTitle?: string
}

const EditIngredientModal = ({
  ingredient,
  recipeId,
  recipeTitle,
}: EditIngredientModalProps) => {
  const queryClient = useQueryClient()
  const { t } = useAppTranslation()
  const [formData, setFormData] = useState<NewIngredientDTO>({
    title: ingredient.title,
    quantity: ingredient.quantity,
    units: ingredient.units,
    notes: ingredient.notes,
    cost: ingredient.cost,
  })

  // // Update form data when ingredient prop changes
  // useEffect(() => {
  //   setFormData({
  //     title: ingredient.title,
  //     quantity: ingredient.quantity,
  //     units: ingredient.units,
  //     notes: ingredient.notes,
  //     cost: ingredient.cost,
  //   })
  // }, [ingredient])

  const updateIngredientMutation = useMutation({
    mutationFn: (ingredientData: Partial<NewIngredientDTO>) =>
      ipcMessenger.invoke(CHANNEL.DB.UPDATE_INGREDIENT, {
        id: ingredient.id,
        payload: ingredientData,
      }),
    onSuccess: result => {
      if (result.success) {
        // Invalidate and refetch ingredients query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INGREDIENTS] })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPE],
        })
        if (recipeId) {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.RECIPE, recipeId],
          })
        }
        activeModalSignal.value = null
      } else {
        t('failedToUpdateIngredient')
      }
    },
    onError: () => {
      t('errorUpdatingIngredient')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Only send changed fields
    const changes: Partial<NewIngredientDTO> = {}
    if (formData.title !== ingredient.title) changes.title = formData.title
    if (formData.quantity !== ingredient.quantity)
      changes.quantity = formData.quantity
    if (formData.units !== ingredient.units) changes.units = formData.units
    if (formData.notes !== ingredient.notes) changes.notes = formData.notes
    if (formData.cost !== ingredient.cost) changes.cost = formData.cost

    if (Object.keys(changes).length === 0) {
      activeModalSignal.value = null
      return
    }

    updateIngredientMutation.mutate(changes)
  }

  const handleInputChange =
    (field: keyof NewIngredientDTO) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'quantity' || field === 'cost'
          ? Number(e.target.value)
          : e.target.value
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }

  return (
    <DefaultModal
      title={`${t('editIngredient')}: ${ingredient.title}${recipeId ? ` (in ${recipeTitle})` : ''}`}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={SPACING.MEDIUM.PX}>
          <TextField
            size="small"
            label={t('ingredientName')}
            value={formData.title}
            onChange={handleInputChange('title')}
            required
            fullWidth
            placeholder="e.g. Flour, Salt, Olive Oil"
          />
          <Stack direction="row" spacing={SPACING.SMALL.PX}>
            <TextField
              size="small"
              label={t('quantity')}
              type="number"
              value={formData.quantity}
              onChange={handleInputChange('quantity')}
              required
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            />

            <FormControl size="small" fullWidth required>
              <InputLabel>{t('units')}</InputLabel>
              <Select
                disabled
                value={formData.units}
                onChange={e =>
                  handleInputChange('units')(
                    e as React.ChangeEvent<HTMLInputElement>,
                  )
                }
                label="Units"
              >
                {Object.entries(ALL_UNITS).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.toLowerCase().replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label={t('cost')}
              type="number"
              value={formData.cost}
              onChange={handleInputChange('cost')}
              required
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            />
          </Stack>
          <Typography
            sx={{ marginTop: '0 !important' }}
            variant="caption"
            color="textSecondary"
          >
            {t('unitsHelpText')}
          </Typography>

          <TextField
            size="small"
            label={t('notes')}
            value={formData.notes}
            onChange={handleInputChange('notes')}
            multiline
            rows={2}
            fullWidth
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              type="button"
              onClick={() => (activeModalSignal.value = null)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={updateIngredientMutation.isPending}
            >
              {updateIngredientMutation.isPending
                ? t('updating')
                : t('updateIngredient')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default EditIngredientModal
