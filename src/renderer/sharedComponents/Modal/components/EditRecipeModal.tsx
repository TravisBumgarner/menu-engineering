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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { useCallback, useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { type NewRecipeDTO, RECIPE_STATUS, type RecipeDTO } from '../../../../shared/recipe.types'
import { areUnitsCompatible } from '../../../../shared/unitConversion'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { NumericInput } from '../../../sharedComponents/NumericInput'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import type { NewPhotoUpload } from '../../../types'
import Photo from '../../Photo'
import UnitSelect from '../../UnitPicker'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface EditRecipeModalProps {
  id: typeof MODAL_ID.EDIT_RECIPE_MODAL
  recipe: RecipeDTO
}

const EditRecipeModal = ({ recipe }: EditRecipeModalProps) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const originalUnit = recipe.units

  const [formData, setFormData] = useState<NewRecipeDTO & NewPhotoUpload>({
    title: recipe.title,
    produces: recipe.produces,
    units: recipe.units,
    status: recipe.status,
    showInMenu: recipe.showInMenu,
    photo: undefined,
  })

  // Fetch recipe data to get usedInRecipes (parent recipes) for the confirmation modal
  const { data: recipeData } = useQuery({
    queryKey: [QUERY_KEYS.RECIPE, recipe.id],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, { id: recipe.id }),
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
    onSuccess: (result) => {
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

  const performUpdate = useCallback(() => {
    updateRecipeMutation.mutate(formData)
  }, [formData, updateRecipeMutation])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined

    if (!file) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      photo: { data: file, extension: file ? file.name.split('.').pop() || '' : '' },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const unitChanged = formData.units !== originalUnit

    if (unitChanged) {
      // Show confirmation modal
      const isCompatible = areUnitsCompatible(originalUnit, formData.units)
      const affectedItems =
        recipeData?.usedInRecipes?.map((parentRecipe) => ({
          id: parentRecipe.id,
          title: parentRecipe.title,
        })) ?? []

      // If recipe isn't used anywhere, no need to show any confirmation
      if (affectedItems.length === 0) {
        performUpdate()
        return
      }

      if (isCompatible) {
        // For compatible changes, show simple confirmation (produces not modified)
        activeModalSignal.value = {
          id: MODAL_ID.UNIT_CHANGE_CONFIRMATION_MODAL,
          itemType: 'recipe',
          itemName: recipe.title,
          fromUnit: originalUnit,
          toUnit: formData.units,
          isCompatible: true,
          onConfirm: performUpdate,
          onCancel: () => {
            // Revert unit selection and reopen this modal
            activeModalSignal.value = {
              id: MODAL_ID.EDIT_RECIPE_MODAL,
              recipe,
            }
          },
        }
      } else {
        // For incompatible changes, show warning with affected parent recipes
        activeModalSignal.value = {
          id: MODAL_ID.UNIT_CHANGE_CONFIRMATION_MODAL,
          itemType: 'recipe',
          itemName: recipe.title,
          fromUnit: originalUnit,
          toUnit: formData.units,
          isCompatible: false,
          affectedItems,
          onConfirm: performUpdate,
          onCancel: () => {
            // Revert unit selection and reopen this modal
            activeModalSignal.value = {
              id: MODAL_ID.EDIT_RECIPE_MODAL,
              recipe,
            }
          },
        }
      }
    } else {
      // No unit change, just update
      performUpdate()
    }
  }

  const handleInputChange =
    (field: keyof NewRecipeDTO) => (e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const handleCheckboxChange = (field: keyof NewRecipeDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }))
  }

  const closeModal = () => {
    activeModalSignal.value = null
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
            <NumericInput
              size="small"
              label={t('produces')}
              value={formData.produces}
              onValidChange={(value) => setFormData({ ...formData, produces: value })}
              required
              fullWidth
              min={0}
            />
            <UnitSelect
              value={formData.units}
              required
              onChange={(value) => setFormData((prev) => ({ ...prev, units: value }))}
            />
          </Stack>

          <FormControl size="small" fullWidth required>
            <InputLabel>{t('status')}</InputLabel>
            <Select value={formData.status} onChange={handleInputChange('status')} label={t('status')}>
              <MenuItem value={RECIPE_STATUS.draft}>{t('draft')}</MenuItem>
              <MenuItem value={RECIPE_STATUS.published}>{t('published')}</MenuItem>
              <MenuItem value={RECIPE_STATUS.archived}>{t('archived')}</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={SPACING.MEDIUM.PX} alignItems="center">
            <FormControlLabel
              sx={{ flexGrow: 1 }}
              control={<Checkbox checked={formData.showInMenu} onChange={handleCheckboxChange('showInMenu')} />}
              label={t('showInMenu')}
            />
            <Input onChange={handlePhotoChange} type="file" sx={{ flexGrow: 1 }} />
            {/* If photo exists from backend, load that. If the user has selected a new photo load that instead. */}
            {recipe.photoSrc && !formData.photo && <Photo type="backend" src={recipe.photoSrc} />}
            {formData.photo && <Photo type="local" data={formData.photo.data} />}
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" type="button" onClick={closeModal}>
              {t('cancel')}
            </Button>
            <Button variant="contained" type="submit" disabled={updateRecipeMutation.isPending}>
              {updateRecipeMutation.isPending ? t('updating') : t('update')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default EditRecipeModal
