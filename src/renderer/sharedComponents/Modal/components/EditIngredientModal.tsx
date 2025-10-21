import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { IngredientDTO, NewIngredientDTO } from '../../../../shared/types'
import { QUERY_KEYS } from '../../../consts'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'
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

  const [formData, setFormData] = useState<NewIngredientDTO>({
    title: ingredient.title,
    quantity: ingredient.quantity,
    units: ingredient.units,
    notes: ingredient.notes,
  })

  // Update form data when ingredient prop changes
  useEffect(() => {
    setFormData({
      title: ingredient.title,
      quantity: ingredient.quantity,
      units: ingredient.units,
      notes: ingredient.notes,
    })
  }, [ingredient])

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
        alert('Ingredient updated successfully!')
        activeModalSignal.value = null
      } else {
        alert('Failed to update ingredient.')
      }
    },
    onError: () => {
      alert('Error updating ingredient.')
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
        field === 'quantity' ? Number(e.target.value) : e.target.value
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }

  return (
    <DefaultModal>
      <Typography variant="h5" component="h2" gutterBottom>
        Edit Ingredient: {ingredient.title}
        {recipeId && ` (in ${recipeTitle})`}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            size="small"
            label="Ingredient Name"
            value={formData.title}
            onChange={handleInputChange('title')}
            required
            fullWidth
            placeholder="e.g. Flour, Salt, Olive Oil"
          />

          <TextField
            size="small"
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange('quantity')}
            required
            fullWidth
            inputProps={{ min: 0, step: 'any' }}
          />

          <TextField
            size="small"
            label="Units"
            value={formData.units}
            onChange={handleInputChange('units')}
            required
            fullWidth
            placeholder="e.g. cups, grams, tablespoons, pieces"
          />

          <TextField
            size="small"
            label="Notes"
            value={formData.notes}
            onChange={handleInputChange('notes')}
            multiline
            rows={2}
            fullWidth
            placeholder="Optional notes about this ingredient"
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              type="button"
              onClick={() => (activeModalSignal.value = null)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={updateIngredientMutation.isPending}
            >
              {updateIngredientMutation.isPending
                ? 'Updating...'
                : 'Update Ingredient'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default EditIngredientModal
