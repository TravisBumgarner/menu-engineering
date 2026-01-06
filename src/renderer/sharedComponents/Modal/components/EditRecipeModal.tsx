import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Input,
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
import { NewPhotoUpload } from '../../../types'
import { getUnitLabel } from '../../../utilities'
import Photo from '../../Photo'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface EditRecipeModalProps {
  id: typeof MODAL_ID.EDIT_RECIPE_MODAL
  recipe: RecipeDTO
}

const EditRecipeModal = ({ recipe }: EditRecipeModalProps) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<NewRecipeDTO & NewPhotoUpload>({
    title: recipe.title,
    produces: recipe.produces,
    units: recipe.units,
    status: recipe.status,
    showInMenu: recipe.showInMenu,
    photo: undefined,
  })

  const updateRecipeMutation = useMutation({
    mutationFn: async (recipeData: Partial<NewRecipeDTO & NewPhotoUpload>) => {
      const payload = {
        ...recipeData,
        photo: recipeData.photo
          ? {
            extension: recipeData.photo.extension,
            bytes: new Uint8Array(await recipeData.photo.data.arrayBuffer()),
          }
          : undefined,
      }

      return await ipcMessenger.invoke(CHANNEL.DB.UPDATE_RECIPE, {
        id: recipe.id,
        payload: payload,
      })
    },
    onSuccess: result => {
      if (result.success) {
        // Invalidate and refetch recipes query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        activeModalSignal.value = null
      } else {
        alert(t('failedToUpdateRecipe'))
      }
    },
    onError: () => {
      alert(t('errorUpdatingRecipe'))
    },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined
    setFormData(prev => ({
      ...prev,
      photo: { data: file!, extension: file ? file.name.split('.').pop() || '' : '' },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    updateRecipeMutation.mutate(formData)
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
    <DefaultModal title={`${t('editRecipe')}: ${recipe.title}`}>
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
          <Stack direction="row" spacing={SPACING.MEDIUM.PX}>
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
                disabled
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
                    {getUnitLabel(key, 'plural')}
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

          <Stack direction="row" spacing={SPACING.MEDIUM.PX} alignItems="center">
            <FormControlLabel
              sx={{ flexGrow: 1 }}
              control={
                <Checkbox
                  checked={formData.showInMenu}
                  onChange={handleCheckboxChange('showInMenu')}
                />
              }
              label={t('showInMenu')}
            />
            <Input onChange={handlePhotoChange} type="file" sx={{ flexGrow: 1 }} />
            {/* If photo exists from backend, load that. If the user has selected a new photo load that instead. */}
            {(recipe.photoSrc && !formData.photo) && <Photo type="backend" src={recipe.photoSrc} />}
            {formData.photo && <Photo type="local" data={formData.photo.data} />}
          </Stack>

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
              disabled={updateRecipeMutation.isPending}
            >
              {updateRecipeMutation.isPending
                ? t('updating')
                : t('update')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default EditRecipeModal
