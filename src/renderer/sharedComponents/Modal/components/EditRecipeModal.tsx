import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { type NewRecipeDTO, RECIPE_STATUS, type RecipeDTO } from '../../../../shared/recipe.types'
import { areUnitsCompatible, convertUnits } from '../../../../shared/unitConversion'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import Icon from '../../../sharedComponents/Icon'
import { NumericInput } from '../../../sharedComponents/NumericInput'
import { uint8ArrayToObjectUrl } from '../../../sharedComponents/Photo'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import type { NewPhotoUpload } from '../../../types'
import UnitSelect from '../../UnitPicker'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

const PhotoThumbnail = ({ src }: { src: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PHOTO, src],
    queryFn: async () => {
      const response = await ipcMessenger.invoke(CHANNEL.FILES.GET_PHOTO, { fileName: src })
      return response.data ? uint8ArrayToObjectUrl(response.data) : null
    },
  })

  if (isLoading) {
    return (
      <Typography variant="caption" color="textSecondary">
        Loading...
      </Typography>
    )
  }

  if (!data) {
    return (
      <Typography variant="caption" color="textSecondary">
        No photo
      </Typography>
    )
  }

  return <img src={data} alt="Recipe" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
}

export interface EditRecipeModalProps {
  id: typeof MODAL_ID.EDIT_RECIPE_MODAL
  recipe: RecipeDTO
}

const EditRecipeModal = ({ recipe }: EditRecipeModalProps) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalUnit = recipe.units

  const [formData, setFormData] = useState<NewRecipeDTO & NewPhotoUpload>({
    title: recipe.title,
    produces: recipe.produces,
    units: recipe.units,
    status: recipe.status,
    showInMenu: recipe.showInMenu,
    photo: undefined,
  })
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false)

  // Fetch recipe data to get usedInRecipes (parent recipes) for the confirmation modal
  const { data: recipeData } = useQuery({
    queryKey: [QUERY_KEYS.RECIPE, recipe.id],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, { id: recipe.id }),
  })

  const updateRecipeMutation = useMutation({
    mutationFn: async (data: { formData: Partial<NewRecipeDTO & NewPhotoUpload>; removePhoto: boolean }) => {
      const payload: Record<string, unknown> = {
        ...data.formData,
        photo: data.formData.photo
          ? {
              extension: data.formData.photo.extension,
              bytes: new Uint8Array(await data.formData.photo.data.arrayBuffer()),
            }
          : undefined,
      }

      // If removing photo, explicitly set photoSrc to null
      if (data.removePhoto && !data.formData.photo) {
        payload.photoSrc = null
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
    updateRecipeMutation.mutate({ formData, removePhoto: removeExistingPhoto })
  }, [formData, removeExistingPhoto, updateRecipeMutation])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined

    if (!file) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      photo: { data: file, extension: file.name.split('.').pop() || '' },
    }))
    setRemoveExistingPhoto(false)
  }

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFormData((prev) => ({ ...prev, photo: undefined }))
    setRemoveExistingPhoto(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePhotoAreaClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const unitChanged = formData.units !== originalUnit

    if (unitChanged) {
      // Show confirmation modal
      const isCompatible = areUnitsCompatible(originalUnit, formData.units)
      // Build affected items with quantity info
      const affectedItems =
        recipeData?.usedInRecipes?.map((parentRecipe) => {
          const convertedQuantity = isCompatible
            ? convertUnits({
                from: originalUnit,
                to: formData.units,
                value: parentRecipe.relationQuantity,
              })
            : null

          return {
            id: parentRecipe.id,
            title: parentRecipe.title,
            quantity: parentRecipe.relationQuantity,
            convertedQuantity: convertedQuantity ?? undefined,
          }
        }) ?? []

      // If recipe isn't used anywhere, no need to show any confirmation
      if (affectedItems.length === 0) {
        performUpdate()
        return
      }

      if (isCompatible) {
        // For compatible changes, show quantity conversion preview
        activeModalSignal.value = {
          id: MODAL_ID.UNIT_CHANGE_CONFIRMATION_MODAL,
          itemType: 'recipe',
          itemName: recipe.title,
          fromUnit: originalUnit,
          toUnit: formData.units,
          isCompatible: true,
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
          <Stack direction="row" spacing={SPACING.MEDIUM.PX}>
            {/* Left column: Photo and On Menu */}
            <Stack spacing={SPACING.MEDIUM.PX} sx={{ width: 200 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <Box
                onClick={handlePhotoAreaClick}
                sx={{
                  width: 200,
                  height: 200,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    borderColor: 'primary.main',
                    '& .remove-photo-btn': {
                      opacity: 1,
                    },
                  },
                }}
              >
                {formData.photo ? (
                  <>
                    <img
                      src={URL.createObjectURL(formData.photo.data)}
                      alt="Recipe"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                    <IconButton
                      className="remove-photo-btn"
                      onClick={handleRemovePhoto}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'error.contrastText',
                        },
                      }}
                    >
                      <Icon name="close" size={16} />
                    </IconButton>
                  </>
                ) : recipe.photoSrc && !removeExistingPhoto ? (
                  <>
                    <PhotoThumbnail src={recipe.photoSrc} />
                    <IconButton
                      className="remove-photo-btn"
                      onClick={handleRemovePhoto}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'error.contrastText',
                        },
                      }}
                    >
                      <Icon name="close" size={16} />
                    </IconButton>
                  </>
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    Click to add photo
                  </Typography>
                )}
              </Box>
            </Stack>

            {/* Right column: Other fields */}
            <Stack spacing={SPACING.MEDIUM.PX} sx={{ flex: 1, minWidth: 0 }}>
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
              <FormControlLabel
                control={<Checkbox checked={formData.showInMenu} onChange={handleCheckboxChange('showInMenu')} />}
                label={t('showInMenu')}
              />
            </Stack>
          </Stack>

          {/* Bottom: Buttons */}
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
