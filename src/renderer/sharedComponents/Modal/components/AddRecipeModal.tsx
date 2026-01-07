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
import log from 'electron-log/renderer'
import type React from 'react'
import { useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { type NewRecipeDTO, RECIPE_STATUS } from '../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../shared/units.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import type { NewPhotoUpload } from '../../../types'
import { getUnitLabel } from '../../../utilities'
import Photo from '../../Photo'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface AddRecipeModalProps {
  id: typeof MODAL_ID.ADD_RECIPE_MODAL
}

const AddRecipeModal = (_props: AddRecipeModalProps) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<NewRecipeDTO & NewPhotoUpload>({
    title: '',
    produces: 0,
    units: ALL_UNITS.units,
    status: RECIPE_STATUS.draft,
    showInMenu: false,
    photo: undefined,
  })

  const handleClose = () => {
    activeModalSignal.value = null
  }

  const addRecipeMutation = useMutation({
    mutationFn: async (recipeData: NewRecipeDTO & NewPhotoUpload) => {
      const payload = {
        ...recipeData,
        photo: recipeData.photo
          ? {
              extension: recipeData.photo.extension,
              bytes: new Uint8Array(await recipeData.photo.data.arrayBuffer()),
            }
          : undefined,
      }

      return ipcMessenger.invoke(CHANNEL.DB.ADD_RECIPE, { payload })
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch recipes query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTOCOMPLETE] })

        activeModalSignal.value = null
      } else {
        alert(t(result.errorCode))
      }
    },
    onError: (error) => {
      log.log(error)
      alert(t('errorAddingRecipe'))
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    addRecipeMutation.mutate(formData)
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined
    setFormData((prev) => ({
      ...prev,
      photo: { data: file!, extension: file ? file.name.split('.').pop() || '' : '' },
    }))
  }

  const preventSubmit =
    addRecipeMutation.isPending || !formData.title.trim() || !formData.units.trim() || formData.produces <= 0

  return (
    <DefaultModal title={t('addNewRecipe')}>
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
                onChange={(e) => handleInputChange('units')(e as React.ChangeEvent<HTMLInputElement>)}
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
          <Typography sx={{ marginTop: '0 !important' }} variant="caption" color="textSecondary">
            {t('unitsHelpText')}
          </Typography>
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
            {formData.photo && <Photo type="local" data={formData.photo.data} />}
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleClose} variant="outlined" type="button">
              {t('close')}
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
