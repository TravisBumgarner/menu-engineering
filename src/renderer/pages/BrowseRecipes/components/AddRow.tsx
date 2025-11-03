import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { NewRecipeDTO, RECIPE_STATUS } from '../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../shared/units.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import Icon from '../../../sharedComponents/Icon'
import { SPACING } from '../../../styles/consts'

const AddRow = ({
  setFocusedRecipeId,
  focusedRecipeId,
}: {
  setFocusedRecipeId: (id: string) => void
  focusedRecipeId: string
}) => {
  const [isCreating, setIsCreating] = useState(false)
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<NewRecipeDTO>({
    title: '',
    produces: 0,
    units: '',
    status: RECIPE_STATUS.draft,
    notes: '',
    showInMenu: false,
  })

  const handleCancel = () => {
    setIsCreating(false)
    setFormData({
      title: '',
      produces: 0,
      units: '',
      status: RECIPE_STATUS.draft,
      notes: '',
      showInMenu: false,
    })
  }

  const addRecipeMutation = useMutation({
    mutationFn: (recipeData: NewRecipeDTO) =>
      ipcMessenger.invoke(CHANNEL.DB.ADD_RECIPE, {
        payload: recipeData,
      }),
    onSuccess: result => {
      if (result.recipeId) {
        alert(t('recipeAddedSuccessfully'))
        setFocusedRecipeId(result.recipeId)
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        handleCancel()
      } else {
        alert(t('failedToAddRecipe'))
      }
    },
    onError: () => {
      alert(t('errorAddingRecipe'))
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    addRecipeMutation.mutate(formData)
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

  if (isCreating) {
    return (
      <TableRow
        sx={{
          '> .MuiTableCell-root': {
            padding: SPACING.TINY.PX,
          },
        }}
      >
        {/* Column 1: Empty (matches checkbox column) */}
        <TableCell colSpan={2}></TableCell>

        {/* Column 2: Title */}
        <TableCell>
          <TextField
            size="small"
            value={formData.title}
            onChange={handleInputChange('title')}
            required
            fullWidth
            placeholder={t('title')}
            variant="outlined"
          />
        </TableCell>

        {/* Column 3: Produces */}
        <TableCell align="right">
          <TextField
            size="small"
            type="number"
            value={formData.produces}
            onChange={handleInputChange('produces')}
            required
            placeholder={t('produces')}
            variant="outlined"
            sx={{ width: '100px' }}
          />
        </TableCell>

        {/* Column 4: Units */}
        <TableCell>
          <FormControl size="small" fullWidth required>
            <Select
              value={formData.units}
              onChange={e =>
                handleInputChange('units')(
                  e as React.ChangeEvent<HTMLInputElement>,
                )
              }
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="" disabled>
                {t('units')}
              </MenuItem>
              {Object.entries(ALL_UNITS).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {t(value as keyof typeof ALL_UNITS)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>

        {/* Column 5: Status */}
        <TableCell>
          <FormControl size="small" fullWidth required>
            <Select
              value={formData.status}
              onChange={handleInputChange('status')}
              variant="outlined"
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
        </TableCell>

        {/* Column 6: Show in Menu */}
        <TableCell align="center">
          <Checkbox
            checked={formData.showInMenu}
            onChange={handleCheckboxChange('showInMenu')}
          />
        </TableCell>

        {/* Column 7: Actions */}
        <TableCell>
          <Box display="flex">
            <IconButton onClick={handleCancel} title={t('cancel')} size="small">
              <Icon name="close" size={30} />
            </IconButton>
            <IconButton
              size="small"
              type="submit"
              onClick={handleSubmit}
              disabled={preventSubmit}
            >
              <Icon name="add" size={30} />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow sx={{ opacity: focusedRecipeId ? 0.1 : 1 }}>
      <TableCell colSpan={8}>
        <Button
          variant="outlined"
          startIcon={<Icon name="add" />}
          onClick={() => setIsCreating(true)}
          fullWidth
        >
          {t('addRecipe')}
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default AddRow
