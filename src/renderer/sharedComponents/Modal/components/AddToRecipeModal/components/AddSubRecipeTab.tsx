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
import type React from 'react'
import { useState } from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import { type NewRecipeDTO, RECIPE_STATUS, type RecipeDTO } from '../../../../../../shared/recipe.types'
import type { UnitPreferences } from '../../../../../../shared/units.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import { NumericInput } from '../../../../../sharedComponents/NumericInput'
import { activeModalSignal } from '../../../../../signals'
import { SPACING } from '../../../../../styles/consts'
import type { NewPhotoUpload } from '../../../../../types'
import { getFirstEnabledUnit, getFromLocalStorage, LOCAL_STORAGE_KEYS } from '../../../../../utilities'
import Photo from '../../../../Photo'
import UnitSelect from '../../../../UnitPicker'
import { DEFAULT_UNIT_PREFERENCES } from '../../SettingsModal/components/TabUnitPreferences'
import RecipeDetails from './RecipeDetails'

const getDefaultUnit = () => {
  const unitPreferences = getFromLocalStorage<UnitPreferences>(
    LOCAL_STORAGE_KEYS.UNIT_PREFERENCES_KEY,
    DEFAULT_UNIT_PREFERENCES,
  )
  return getFirstEnabledUnit(unitPreferences)
}

const AddRecipeForm = ({ parentRecipe }: { parentRecipe: RecipeDTO }) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const [recipeQuantity, setRecipeQuantity] = useState<number>(0)

  const [formData, setFormData] = useState<NewRecipeDTO & NewPhotoUpload>(() => ({
    title: '',
    produces: 0,
    units: getDefaultUnit(),
    status: RECIPE_STATUS.draft,
    showInMenu: false,
    photo: undefined,
  }))

  const handleClose = () => {
    activeModalSignal.value = null
  }

  const addSubRecipeMutation = useMutation({
    mutationFn: async (args: {
      newRecipe: NewRecipeDTO & NewPhotoUpload
      parentRecipeId: string
      shouldClose: boolean
    }) =>
      ipcMessenger
        .invoke(CHANNEL.DB.ADD_SUB_RECIPE, {
          payload: {
            newRecipe: {
              ...args.newRecipe,
              photo: args.newRecipe.photo
                ? {
                    bytes: new Uint8Array(await args.newRecipe.photo.data.arrayBuffer()),
                    extension: args.newRecipe.photo.extension,
                  }
                : undefined,
            },
            parentRecipeId: args.parentRecipeId,
            units: args.newRecipe.units,
          },
        })
        .then((result) => ({ ...result, shouldClose: args.shouldClose })),
    onSuccess: async (result) => {
      if (result.success) {
        // Invalidate and refetch queries
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTOCOMPLETE] })

        if (!result.shouldClose) {
          setFormData({
            title: '',
            produces: 0,
            units: getDefaultUnit(),
            status: RECIPE_STATUS.draft,
            showInMenu: false,
            photo: undefined,
          })
          setRecipeQuantity(0)
        } else {
          activeModalSignal.value = null
        }
      } else {
        alert(t(result.errorCode))
      }
    },
    onError: () => {
      alert(t('errorAddingSubRecipe'))
    },
  })

  const handleSubmit = (shouldClose: boolean) => (e: React.FormEvent) => {
    e.preventDefault()
    addSubRecipeMutation.mutate({
      newRecipe: formData,
      parentRecipeId: parentRecipe.id,
      shouldClose,
    })
  }

  const handleInputChange =
    (field: keyof NewRecipeDTO) => (e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined
    setFormData((prev) => ({
      ...prev,
      photo: file ? { data: file, extension: file ? file.name.split('.').pop() || '' : '' } : undefined,
    }))
  }

  const handleCheckboxChange = (field: keyof NewRecipeDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }))
  }

  const preventSubmit =
    addSubRecipeMutation.isPending || !formData.title.trim() || !formData.units.trim() || formData.produces <= 0

  return (
    <Box
      component="form"
      sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}
    >
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
          <NumericInput
            size="small"
            label={t('produces')}
            value={formData.produces}
            onValidChange={(value) => setFormData({ ...formData, produces: value })}
            required
            sx={{ flexGrow: 1 }}
            min={0}
          />
          <UnitSelect value={formData.units} onChange={(units) => setFormData({ ...formData, units })} />
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
          {formData.photo && <Photo type="local" data={formData.photo.data} />}
        </Stack>
        <RecipeDetails units={formData.units} setQuantity={setRecipeQuantity} quantity={recipeQuantity} />
      </Stack>
      <Stack direction="row" spacing={SPACING.SMALL.PX} justifyContent="flex-end">
        <Button size="small" onClick={handleClose} variant="outlined" type="button">
          {t('close')}
        </Button>
        <Button size="small" variant="outlined" type="submit" disabled={preventSubmit} onClick={handleSubmit(true)}>
          {addSubRecipeMutation.isPending ? t('saving') : t('save')}
        </Button>
        <Button size="small" variant="contained" type="button" onClick={handleSubmit(false)} disabled={preventSubmit}>
          {addSubRecipeMutation.isPending ? t('saving') : t('saveAndAddAnother')}
        </Button>
      </Stack>
    </Box>
  )
}

export default AddRecipeForm
