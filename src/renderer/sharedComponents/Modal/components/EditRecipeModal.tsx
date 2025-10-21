import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import {
  NewRecipeDTO,
  RECIPE_STATUS,
  RecipeDTO,
} from '../../../../shared/types'
import { QUERY_KEYS } from '../../../consts'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface EditRecipeModalProps {
  id: typeof MODAL_ID.EDIT_RECIPE_MODAL
  recipe: RecipeDTO
}

const EditRecipeModal = ({ id, recipe }: EditRecipeModalProps) => {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<NewRecipeDTO>({
    title: recipe.title,
    produces: recipe.produces,
    units: recipe.units,
    status: recipe.status,
    notes: recipe.notes,
    showInMenu: recipe.showInMenu,
  })

  // Update form data when recipe prop changes
  useEffect(() => {
    setFormData({
      title: recipe.title,
      produces: recipe.produces,
      units: recipe.units,
      status: recipe.status,
      notes: recipe.notes,
      showInMenu: recipe.showInMenu,
    })
  }, [recipe])

  const updateRecipeMutation = useMutation({
    mutationFn: (recipeData: Partial<NewRecipeDTO>) =>
      ipcMessenger.invoke(CHANNEL.DB.UPDATE_RECIPE, {
        id: recipe.id,
        payload: recipeData,
      }),
    onSuccess: result => {
      if (result.success) {
        // Invalidate and refetch recipes query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPE, recipe.id],
        })
        alert('Recipe updated successfully!')
        activeModalSignal.value = null
      } else {
        alert('Failed to update recipe.')
      }
    },
    onError: () => {
      alert('Error updating recipe.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Only send changed fields
    const changes: Partial<NewRecipeDTO> = {}
    if (formData.title !== recipe.title) changes.title = formData.title
    if (formData.produces !== recipe.produces)
      changes.produces = formData.produces
    if (formData.units !== recipe.units) changes.units = formData.units
    if (formData.status !== recipe.status) changes.status = formData.status
    if (formData.notes !== recipe.notes) changes.notes = formData.notes
    if (formData.showInMenu !== recipe.showInMenu)
      changes.showInMenu = formData.showInMenu

    if (Object.keys(changes).length === 0) {
      activeModalSignal.value = null
      return
    }

    updateRecipeMutation.mutate(changes)
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

  const handleCheckboxChange =
    (field: keyof NewRecipeDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.checked,
      }))
    }

  return (
    <DefaultModal>
      <Typography variant="h5" component="h2" gutterBottom>
        Edit Recipe: {recipe.title}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            size="small"
            label="Title"
            value={formData.title}
            onChange={handleInputChange('title')}
            required
            fullWidth
          />

          <TextField
            size="small"
            label="Produces"
            type="number"
            value={formData.produces}
            onChange={handleInputChange('produces')}
            required
            fullWidth
          />

          <TextField
            size="small"
            label="Units"
            value={formData.units}
            onChange={handleInputChange('units')}
            required
            fullWidth
            placeholder="e.g. servings, portions, pieces"
          />

          <FormControl size="small" fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={handleInputChange('status')}
              label="Status"
            >
              <MenuItem value={RECIPE_STATUS.DRAFT}>Draft</MenuItem>
              <MenuItem value={RECIPE_STATUS.PUBLISHED}>Published</MenuItem>
              <MenuItem value={RECIPE_STATUS.ARCHIVED}>Archived</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Notes"
            value={formData.notes}
            onChange={handleInputChange('notes')}
            multiline
            rows={2}
            fullWidth
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.showInMenu}
                onChange={handleCheckboxChange('showInMenu')}
              />
            }
            label="Show in Menu"
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
              disabled={updateRecipeMutation.isPending}
            >
              {updateRecipeMutation.isPending ? 'Updating...' : 'Update Recipe'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default EditRecipeModal
