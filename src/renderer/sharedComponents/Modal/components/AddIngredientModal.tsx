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
import { NewIngredientDTO, RecipeDTO } from '../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../shared/units.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface AddIngredientModalProps {
  id: typeof MODAL_ID.ADD_INGREDIENT_MODAL
  recipe?: RecipeDTO
}

const AddIngredientModal = ({ recipe }: AddIngredientModalProps) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const [ingredientFormData, setIngredientFormData] =
    useState<NewIngredientDTO>({
      title: '',
      quantity: 0,
      units: '',
      notes: '',
      cost: 0,
    })

  const addIngredientMutation = useMutation({
    mutationFn: ({
      newIngredient,
      recipeId,
      shouldClose,
    }: {
      newIngredient: NewIngredientDTO
      recipeId?: string
      shouldClose: boolean
    }) =>
      ipcMessenger
        .invoke(CHANNEL.DB.ADD_INGREDIENT, {
          payload: {
            newIngredient,
            recipeId,
          },
        })
        .then(result => ({ ...result, shouldClose })),
    onSuccess: result => {
      if (result.success) {
        // Invalidate and refetch ingredients query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INGREDIENTS] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        alert('Ingredient added successfully!')

        if (result.shouldClose) {
          activeModalSignal.value = null
        } else {
          // Reset form for "Save & Add another"
          setIngredientFormData({
            title: '',
            quantity: 0,
            units: '',
            notes: '',
            cost: 0,
          })
        }
      } else {
        alert(t('failedToAddIngredient'))
      }
    },
    onError: () => {
      alert(t('errorAddingIngredient'))
    },
  })

  const handleSubmit = (shouldClose: boolean) => (e: React.FormEvent) => {
    e.preventDefault()
    addIngredientMutation.mutate({
      newIngredient: ingredientFormData,
      recipeId: recipe?.id,
      shouldClose,
    })
  }

  const handleInputChange =
    (field: keyof NewIngredientDTO) =>
    (
      e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } },
    ) => {
      const value =
        field === 'quantity' || field === 'cost'
          ? Number(e.target.value)
          : e.target.value
      setIngredientFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }

  const preventSubmit =
    addIngredientMutation.isPending ||
    !ingredientFormData.title.trim() ||
    ingredientFormData.quantity <= 0 ||
    !ingredientFormData.units.trim()

  return (
    <DefaultModal>
      <Typography variant="h5" component="h2" gutterBottom>
        {recipe
          ? `${t('addNewIngredient')} to ${recipe.title}`
          : t('addNewIngredient')}
      </Typography>

      <Box component="form">
        <Stack spacing={3}>
          <TextField
            size="small"
            label={t('ingredientName')}
            value={ingredientFormData.title}
            onChange={handleInputChange('title')}
            required
            fullWidth
            placeholder={t('ingredientNamePlaceholder')}
          />

          <TextField
            size="small"
            label={t('quantity')}
            type="number"
            value={ingredientFormData.quantity}
            onChange={handleInputChange('quantity')}
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          />

          <FormControl size="small" fullWidth required>
            <InputLabel>{t('units')}</InputLabel>
            <Select
              value={ingredientFormData.units}
              onChange={e =>
                handleInputChange('units')(
                  e as React.ChangeEvent<HTMLInputElement>,
                )
              }
              label={t('units')}
            >
              {Object.entries(ALL_UNITS).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {t(value as keyof typeof ALL_UNITS)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label={t('cost')}
            type="number"
            value={ingredientFormData.cost}
            onChange={handleInputChange('cost')}
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          />

          <TextField
            size="small"
            label={t('notes')}
            value={ingredientFormData.notes}
            onChange={handleInputChange('notes')}
            multiline
            rows={2}
            fullWidth
            placeholder={t('optionalNotesPlaceholder')}
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
              variant="outlined"
              type="button"
              onClick={handleSubmit(true)}
              disabled={preventSubmit}
            >
              {addIngredientMutation.isPending ? t('saving') : t('save')}
            </Button>
            <Button
              variant="contained"
              type="button"
              onClick={handleSubmit(false)}
              disabled={preventSubmit}
            >
              {addIngredientMutation.isPending
                ? t('saving')
                : t('saveAndAddAnother')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default AddIngredientModal
