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
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { getUnitLabel } from '../../../utilities'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface AddRecipeModalProps {
  id: typeof MODAL_ID.ADD_RECIPE_MODAL
  parentRecipe?: RecipeDTO
}

const AddRecipeModal = ({ parentRecipe }: AddRecipeModalProps) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<NewRecipeDTO>({
    title: '',
    produces: 0,
    units: ALL_UNITS.units,
    status: RECIPE_STATUS.draft,
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
      if (result.recipeId) {
        // Invalidate and refetch recipes query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTOCOMPLETE] })

        activeModalSignal.value = null
      } else {
        alert(t('failedToAddRecipe'))
      }
    },
    onError: () => {
      alert(t('errorAddingRecipe'))
    },
  })

  const addSubRecipeMutation = useMutation({
    mutationFn: (args: { newRecipe: NewRecipeDTO; parentRecipeId: string }) =>
      ipcMessenger.invoke(CHANNEL.DB.ADD_SUB_RECIPE, {
        payload: {
          newRecipe: args.newRecipe,
          parentRecipeId: args.parentRecipeId,
          units: args.newRecipe.units,
        },
      }),
    onSuccess: async result => {
      if (result.success) {
        // Invalidate and refetch queries
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTOCOMPLETE] })
        activeModalSignal.value = null
      } else {
        alert(t('failedToAddSubRecipe'))
      }
    },
    onError: () => {
      alert(t('errorAddingSubRecipe'))
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (parentRecipe) {
      await addSubRecipeMutation.mutate({
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
    <DefaultModal
      title={`${t('addNewRecipe')} ${parentRecipe ? `to ${parentRecipe.title}` : ''}`}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={SPACING.MEDIUM.PX}>
          <TextField
            size="small"
            label={t('title')}
            value={formData.title}
            onChange={handleInputChange('title')}
            required
            fullWidth
          />
          <Stack direction="row" spacing={SPACING.SMALL.PX}>
            <TextField
              size="small"
              label={t('produces')}
              type="number"
              value={formData.produces}
              onChange={handleInputChange('produces')}
              required
              fullWidth
            />
            <FormControl size="small" fullWidth required>
              <InputLabel>{t('units')}</InputLabel>
              <Select
                value={formData.units}
                onChange={e =>
                  handleInputChange('units')(
                    e as React.ChangeEvent<HTMLInputElement>,
                  )
                }
                label={t('units')}
              >
                {Object.entries(ALL_UNITS).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {getUnitLabel(value, 'plural')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Typography
            sx={{ marginTop: '0 !important' }}
            variant="caption"
            color="textSecondary"
          >
            {t('unitsHelpText')}
          </Typography>
          <FormControl size="small" fullWidth required>
            <InputLabel>{t('status')}</InputLabel>
            <Select
              value={formData.status}
              onChange={handleInputChange('status')}
              label={t('status')}
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
            label={t('showInMenu')}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCancel} variant="outlined" type="button">
              {t('cancel')}
            </Button>
            <Button variant="contained" type="submit" disabled={preventSubmit}>
              {addRecipeMutation.isPending ? t('adding') : t('addRecipe')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default AddRecipeModal
