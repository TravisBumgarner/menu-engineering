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
import React, { useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import {
  NewRecipeDTO,
  RECIPE_STATUS,
  RecipeDTO,
} from '../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../shared/units.types'
import { QUERY_KEYS } from '../../../consts'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface AddRecipeModalProps {
  id: typeof MODAL_ID.ADD_RECIPE_MODAL
  parentRecipe?: RecipeDTO
}

const AddRecipeModal = ({ id, parentRecipe }: AddRecipeModalProps) => {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<NewRecipeDTO>({
    title: '',
    produces: 1,
    units: '',
    status: RECIPE_STATUS.DRAFT,
    notes: '',
    showInMenu: false,
  })

  const handleCancel = () => {
    activeModalSignal.value = null
  }

  const addRecipeMutation = useMutation({
    mutationFn: (recipeData: NewRecipeDTO) =>
      ipcMessenger.invoke(CHANNEL.DB.ADD_RECIPE, {
        payload: recipeData,
      }),
    onSuccess: result => {
      if (result.success) {
        // Invalidate and refetch recipes query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        alert('Recipe added successfully!')
        activeModalSignal.value = null
      } else {
        alert('Failed to add recipe.')
      }
    },
    onError: () => {
      alert('Error adding recipe.')
    },
  })

  const addSubRecipeMutation = useMutation({
    mutationFn: (args: { newRecipe: NewRecipeDTO; parentRecipeId: string }) =>
      ipcMessenger.invoke(CHANNEL.DB.ADD_SUB_RECIPE, {
        payload: {
          newRecipe: args.newRecipe,
          parentRecipeId: args.parentRecipeId,
        },
      }),
    onSuccess: result => {
      if (result.success) {
        // Invalidate and refetch recipes query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        alert('Sub-recipe added successfully!')
        activeModalSignal.value = null
      } else {
        alert('Failed to add sub-recipe.')
      }
    },
    onError: () => {
      alert('Error adding sub-recipe.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (parentRecipe) {
      addSubRecipeMutation.mutate({
        newRecipe: formData,
        parentRecipeId: parentRecipe.id,
      })
    } else {
      addRecipeMutation.mutate(formData)
    }
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

  const preventSubmit =
    addRecipeMutation.isPending ||
    !formData.title.trim() ||
    !formData.units.trim() ||
    formData.produces <= 0

  return (
    <DefaultModal>
      <Typography variant="h5" component="h2" gutterBottom>
        {parentRecipe
          ? `Add New Sub-Recipe to ${parentRecipe.title}`
          : 'Add New Recipe'}
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

          <FormControl size="small" fullWidth required>
            <InputLabel>Units</InputLabel>
            <Select
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
            <Button onClick={handleCancel} variant="outlined" type="button">
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={preventSubmit}>
              {addRecipeMutation.isPending ? 'Adding...' : 'Add Recipe'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default AddRecipeModal
