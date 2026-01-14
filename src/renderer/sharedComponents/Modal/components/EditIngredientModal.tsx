import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import type { IngredientDTO, NewIngredientDTO } from '../../../../shared/recipe.types'
import { ALL_UNITS, type AllUnits } from '../../../../shared/units.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { NumericInput } from '../../../sharedComponents/NumericInput'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { getUnitLabel } from '../../../utilities'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface EditIngredientModalProps {
  id: typeof MODAL_ID.EDIT_INGREDIENT_MODAL
  ingredient: IngredientDTO
  recipeId?: string
  recipeTitle?: string
}

type FormData = {
  title: string
  quantity: number
  units: AllUnits
  cost: number
}

const EditIngredientModal = ({ ingredient, recipeId, recipeTitle }: EditIngredientModalProps) => {
  const queryClient = useQueryClient()
  const { t } = useAppTranslation()
  const [formData, setFormData] = useState<FormData>({
    title: ingredient.title,
    quantity: 1,
    units: ingredient.units,
    cost: ingredient.unitCost,
  })

  const updateIngredientMutation = useMutation({
    mutationFn: (ingredientData: Partial<NewIngredientDTO>) =>
      ipcMessenger.invoke(CHANNEL.DB.UPDATE_INGREDIENT, {
        id: ingredient.id,
        payload: ingredientData,
      }),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch ingredients query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INGREDIENTS] })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RECIPE],
        })
        if (recipeId) {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.RECIPE, recipeId],
          })
        }
        activeModalSignal.value = null
      } else {
        t('failedToUpdateIngredient')
      }
    },
    onError: () => {
      t('errorUpdatingIngredient')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateIngredientMutation.mutate({
      title: formData.title,
      unitCost: formData.cost / formData.quantity,
    })
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'quantity' || field === 'unitCost' ? Number(e.target.value) : e.target.value
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const closeModal = () => {
    activeModalSignal.value = null
  }

  return (
    <DefaultModal title={`${t('editIngredient')}: ${ingredient.title}${recipeId ? ` (in ${recipeTitle})` : ''}`}>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={SPACING.MEDIUM.PX}>
          <TextField
            size="small"
            label={t('ingredientName')}
            value={formData.title}
            onChange={handleInputChange('title')}
            required
            fullWidth
            placeholder="e.g. Flour, Salt, Olive Oil"
          />
          <Stack direction="row" spacing={SPACING.SMALL.PX} sx={{ alignItems: 'center' }}>
            <NumericInput
              size="small"
              label={t('cost')}
              value={formData.cost}
              onValidChange={(value) => setFormData({ ...formData, cost: value })}
              required
              sx={{ width: '100px' }}
              min={0}
            />

            <Typography>/</Typography>

            <NumericInput
              size="small"
              label={t('quantity')}
              value={formData.quantity}
              onValidChange={(value) => setFormData({ ...formData, quantity: value })}
              required
              sx={{ width: '100px' }}
              min={0}
            />
            <FormControl size="small" required sx={{ width: '150px' }}>
              <InputLabel>{t('units')}</InputLabel>
              <Select
                disabled
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

            <Typography>=</Typography>

            <Typography>
              ${(formData.cost / formData.quantity).toFixed(2)}/ {getUnitLabel(formData.units, 'singular')}
            </Typography>
          </Stack>
          <Typography sx={{ marginTop: '0 !important' }} variant="caption" color="textSecondary">
            {t('unitsHelpText')}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" type="button" onClick={closeModal}>
              {t('cancel')}
            </Button>
            <Button variant="contained" type="submit" disabled={updateIngredientMutation.isPending}>
              {updateIngredientMutation.isPending ? t('updating') : t('update')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default EditIngredientModal
