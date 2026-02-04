import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { useCallback, useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import type { IngredientDTO, NewIngredientDTO } from '../../../../shared/recipe.types'
import { areUnitsCompatible, convertUnits } from '../../../../shared/unitConversion'
import type { AllUnits } from '../../../../shared/units.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { NumericInput } from '../../../sharedComponents/NumericInput'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { getUnitLabel } from '../../../utilities'
import UnitSelect from '../../UnitPicker'
import { MODAL_ID } from '../Modal.consts'
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
  const originalUnit = ingredient.units

  const [formData, setFormData] = useState<FormData>({
    title: ingredient.title,
    quantity: 1,
    units: ingredient.units,
    cost: ingredient.unitCost,
  })

  // Fetch ingredient data to get usedInRecipes for the confirmation modal
  const { data: ingredientData } = useQuery({
    queryKey: [QUERY_KEYS.INGREDIENT, ingredient.id],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_INGREDIENT, { id: ingredient.id }),
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

  const performUpdate = useCallback(() => {
    updateIngredientMutation.mutate({
      title: formData.title,
      unitCost: formData.cost / formData.quantity,
      units: formData.units,
    })
  }, [formData, updateIngredientMutation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const unitChanged = formData.units !== originalUnit

    if (unitChanged) {
      // Show confirmation modal
      const isCompatible = areUnitsCompatible(originalUnit, formData.units)
      const currentUnitCost = formData.cost / formData.quantity

      if (isCompatible) {
        // For compatible changes, show conversion preview
        const convertedUnitCost = convertUnits({
          from: originalUnit,
          to: formData.units,
          value: currentUnitCost,
        })

        activeModalSignal.value = {
          id: MODAL_ID.UNIT_CHANGE_CONFIRMATION_MODAL,
          itemType: 'ingredient',
          itemName: ingredient.title,
          fromUnit: originalUnit,
          toUnit: formData.units,
          isCompatible: true,
          originalUnitCost: currentUnitCost,
          convertedUnitCost: convertedUnitCost ?? currentUnitCost,
          onConfirm: performUpdate,
          onCancel: () => {
            // Revert unit selection and reopen this modal
            activeModalSignal.value = {
              id: MODAL_ID.EDIT_INGREDIENT_MODAL,
              ingredient,
              recipeId,
              recipeTitle,
            }
          },
        }
      } else {
        // For incompatible changes, show warning with affected recipes
        const affectedItems =
          ingredientData?.usedInRecipes?.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
          })) ?? []

        // If ingredient isn't used anywhere, no need to show warning
        if (affectedItems.length === 0) {
          performUpdate()
          return
        }

        activeModalSignal.value = {
          id: MODAL_ID.UNIT_CHANGE_CONFIRMATION_MODAL,
          itemType: 'ingredient',
          itemName: ingredient.title,
          fromUnit: originalUnit,
          toUnit: formData.units,
          isCompatible: false,
          affectedItems,
          onConfirm: performUpdate,
          onCancel: () => {
            // Revert unit selection and reopen this modal
            activeModalSignal.value = {
              id: MODAL_ID.EDIT_INGREDIENT_MODAL,
              ingredient,
              recipeId,
              recipeTitle,
            }
          },
        }
      }
    } else {
      // No unit change, just update
      performUpdate()
    }
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
            <UnitSelect
              value={formData.units}
              required
              onChange={(value) => setFormData((prev) => ({ ...prev, units: value }))}
            />

            <Typography>=</Typography>

            <Typography>
              ${(formData.cost / formData.quantity).toFixed(2)}/ {getUnitLabel(formData.units, 'singular')}
            </Typography>
          </Stack>

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
