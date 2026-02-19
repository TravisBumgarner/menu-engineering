import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import type React from 'react'
import { useRef, useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { type NewRecipeDTO, RECIPE_STATUS } from '../../../../shared/recipe.types'
import type { UnitPreferences } from '../../../../shared/units.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { NumericInput } from '../../../sharedComponents/NumericInput'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import type { NewPhotoUpload } from '../../../types'
import { getFirstEnabledUnit, getFromLocalStorage, LOCAL_STORAGE_KEYS } from '../../../utilities'
import Icon from '../../Icon'
import UnitSelect from '../../UnitPicker'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'
import { DEFAULT_UNIT_PREFERENCES } from './SettingsModal/components/TabUnitPreferences'

export interface AddRecipeModalProps {
  id: typeof MODAL_ID.ADD_RECIPE_MODAL
}

const getDefaultUnit = () => {
  const unitPreferences = getFromLocalStorage<UnitPreferences>(
    LOCAL_STORAGE_KEYS.UNIT_PREFERENCES_KEY,
    DEFAULT_UNIT_PREFERENCES,
  )
  return getFirstEnabledUnit(unitPreferences)
}

const AddRecipeModal = (_props: AddRecipeModalProps) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: categoriesData } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_CATEGORIES, undefined),
  })

  const [formData, setFormData] = useState<NewRecipeDTO & NewPhotoUpload>(() => ({
    title: '',
    produces: 0,
    units: getDefaultUnit(),
    status: RECIPE_STATUS.draft,
    showInMenu: false,
    categoryIds: [],
    photo: undefined,
  }))

  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)

  const addCategoryMutation = useMutation({
    mutationFn: (title: string) => ipcMessenger.invoke(CHANNEL.DB.ADD_CATEGORY, { payload: { title } }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] })
        setFormData((prev) => ({ ...prev, categoryIds: [...(prev.categoryIds || []), result.categoryId] }))
        setNewCategoryTitle('')
      }
    },
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
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: { data: file, extension: file.name.split('.').pop() || '' },
      }))
    }
  }

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFormData((prev) => ({ ...prev, photo: undefined }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePhotoAreaClick = () => {
    fileInputRef.current?.click()
  }

  const preventSubmit =
    addRecipeMutation.isPending || !formData.title.trim() || !formData.units.trim() || formData.produces <= 0

  return (
    <DefaultModal title={t('addNewRecipe')}>
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
              <Stack direction="row" spacing={SPACING.XS.PX} alignItems="center">
                <FormControl size="small" fullWidth>
                  <InputLabel>{t('category')}</InputLabel>
                  <Select
                    multiple
                    value={formData.categoryIds || []}
                    onChange={(e) => {
                      const value = e.target.value as string[]
                      setFormData((prev) => ({ ...prev, categoryIds: value }))
                    }}
                    label={t('category')}
                    renderValue={(selected) => {
                      const cats = categoriesData?.categories ?? []
                      return selected.map((id) => cats.find((c) => c.id === id)?.title ?? id).join(', ')
                    }}
                  >
                    {(categoriesData?.categories ?? []).map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        <Checkbox size="small" checked={(formData.categoryIds || []).includes(cat.id)} />
                        <ListItemText primary={cat.title} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title={t('addCategory')}>
                  <IconButton
                    size="small"
                    onClick={() => setShowAddCategory((prev) => !prev)}
                  >
                    <Icon name="edit" size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
              {showAddCategory && (
                <Stack direction="row" spacing={SPACING.XS.PX}>
                  <TextField
                    size="small"
                    placeholder={t('categoryName')}
                    value={newCategoryTitle}
                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newCategoryTitle.trim()) addCategoryMutation.mutate(newCategoryTitle.trim())
                      }
                    }}
                    sx={{ flex: 1 }}
                    autoFocus
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => addCategoryMutation.mutate(newCategoryTitle.trim())}
                    disabled={!newCategoryTitle.trim() || addCategoryMutation.isPending}
                    type="button"
                  >
                    {t('addCategory')}
                  </Button>
                </Stack>
              )}
              <FormControlLabel
                control={<Checkbox checked={formData.showInMenu} onChange={handleCheckboxChange('showInMenu')} />}
                label={t('showInMenu')}
              />
            </Stack>
          </Stack>

          {/* Bottom: Buttons */}
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
