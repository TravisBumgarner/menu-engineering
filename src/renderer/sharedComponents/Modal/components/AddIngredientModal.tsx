import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { NewIngredientDTO } from '../../../../shared/types'
import { QUERY_KEYS } from '../../../consts'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface AddIngredientModalProps {
  id: typeof MODAL_ID.ADD_INGREDIENT_MODAL
  recipeId?: string
  recipeTitle?: string
}

const AddIngredientModal = ({
  id,
  recipeId,
  recipeTitle,
}: AddIngredientModalProps) => {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<NewIngredientDTO>({
    title: '',
    quantity: 0,
    units: '',
    notes: '',
  })

  const addIngredientMutation = useMutation({
    mutationFn: (data: NewIngredientDTO & { recipeId?: string }) =>
      ipcMessenger.invoke(CHANNEL.DB.ADD_INGREDIENT, {
        payload: data,
      }),
    onSuccess: result => {
      if (result.success) {
        // Invalidate and refetch ingredients query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        alert('Ingredient added successfully!')
        activeModalSignal.value = null
      } else {
        alert('Failed to add ingredient.')
      }
    },
    onError: () => {
      alert('Error adding ingredient.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addIngredientMutation.mutate({ ...formData, recipeId })
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
        Add New Ingredient {recipeId ? `to Recipe ${recipeTitle}` : ''}
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
              disabled={addIngredientMutation.isPending}
            >
              {addIngredientMutation.isPending ? 'Adding...' : 'Add Ingredient'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default AddIngredientModal
