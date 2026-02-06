import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import type { NewIngredientDTO } from '../../../../shared/recipe.types'
import { type AllUnits, type UnitPreferences } from '../../../../shared/units.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { NumericInput } from '../../../sharedComponents/NumericInput'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { formatCurrency, getFirstEnabledUnit, getFromLocalStorage, getUnitLabel, LOCAL_STORAGE_KEYS } from '../../../utilities'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'
import UnitSelect from '../../UnitPicker'
import { DEFAULT_UNIT_PREFERENCES } from './SettingsModal/components/TabUnitPreferences'

export interface AddIngredientModalProps {
  id: typeof MODAL_ID.ADD_INGREDIENT_MODAL
}

type FormData = {
  title: string
  quantity: number
  units: AllUnits
  cost: number
}

const getDefaultUnit = () => {
  const unitPreferences = getFromLocalStorage<UnitPreferences>(
    LOCAL_STORAGE_KEYS.UNIT_PREFERENCES_KEY,
    DEFAULT_UNIT_PREFERENCES,
  )
  return getFirstEnabledUnit(unitPreferences)
}

const AddIngredientModal = (_props: AddIngredientModalProps) => {
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const [ingredientFormData, setIngredientFormData] = useState<FormData>(() => ({
    title: '',
    quantity: 1,
    units: getDefaultUnit(),
    cost: 0,
  }))

  const addIngredientMutation = useMutation({
    mutationFn: ({
      newIngredient,
      shouldClose,
    }: {
      newIngredient: NewIngredientDTO
      recipeId?: string
      shouldClose: boolean
    }) =>
      ipcMessenger
        .invoke(CHANNEL.DB.ADD_INGREDIENT, {
          payload: {
            newIngredient,
            units: newIngredient.units,
          },
        })
        .then((result) => ({ ...result, shouldClose })),
    onSuccess: (result) => {
      if (!result.success) {
        alert(t(result.errorCode))
        return
      }

      if (result.success) {
        // Invalidate and refetch ingredients query
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INGREDIENTS] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTOCOMPLETE] })

        if (result.shouldClose) {
          activeModalSignal.value = null
        } else {
          // Reset form for "Save & Add another"
          setIngredientFormData({
            title: '',
            quantity: 1,
            units: getDefaultUnit(),
            cost: 0,
          })
        }
      } else {
        alert(t('failedToAddIngredient'))
      }
    },
    onError: () => {
      alert(t('errorAddingIngredient'))
    },
  })

  const handleSubmit = (shouldClose: boolean) => (e: React.FormEvent) => {
    e.preventDefault()
    addIngredientMutation.mutate({
      newIngredient: {
        title: ingredientFormData.title,
        units: ingredientFormData.units,
        unitCost: ingredientFormData.cost / ingredientFormData.quantity,
      },
      shouldClose,
    })
  }

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }) => {
      const value = field === 'quantity' || field === 'unitCost' ? Number(e.target.value) : e.target.value
      setIngredientFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  const closeModal = () => {
    activeModalSignal.value = null
  }

  const preventSubmit =
    addIngredientMutation.isPending ||
    !ingredientFormData.title.trim() ||
    ingredientFormData.quantity <= 0 ||
    !ingredientFormData.units.trim()

  return (
    <DefaultModal title={t('addNewIngredient')}>
      <Box component="form">
        <Stack spacing={SPACING.SM.PX}>
          <TextField
            size="small"
            label={t('ingredientName')}
            value={ingredientFormData.title}
            onChange={handleInputChange('title')}
            required
            fullWidth
            placeholder={t('ingredientNamePlaceholder')}
          />

          <Stack spacing={SPACING.XS.PX} direction="row" sx={{ alignItems: 'center' }}>
            <NumericInput
              size="small"
              label={t('cost')}
              value={ingredientFormData.cost}
              onValidChange={(value) => setIngredientFormData({ ...ingredientFormData, cost: value })}
              required
              sx={{ width: '100px' }}
              min={0}
            />

            <Typography>/</Typography>

            <NumericInput
              size="small"
              label={t('quantity')}
              value={ingredientFormData.quantity}
              onValidChange={(value) => setIngredientFormData({ ...ingredientFormData, quantity: value })}
              required
              sx={{ width: '100px' }}
              min={0}
            />
            <UnitSelect
              value={ingredientFormData.units}
              required
              onChange={(value) => setIngredientFormData((prev) => ({ ...prev, units: value }))}
            />

            <Typography>=</Typography>

            <Typography>
              {formatCurrency(ingredientFormData.cost / ingredientFormData.quantity)}/{' '}
              {getUnitLabel(ingredientFormData.units, 1)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={SPACING.XS.PX} justifyContent="flex-end">
            <Button variant="outlined" type="button" onClick={closeModal}>
              {t('close')}
            </Button>
            <Button variant="outlined" type="button" onClick={handleSubmit(true)} disabled={preventSubmit}>
              {addIngredientMutation.isPending ? t('saving') : t('save')}
            </Button>
            <Button variant="contained" type="button" onClick={handleSubmit(false)} disabled={preventSubmit}>
              {addIngredientMutation.isPending ? t('saving') : t('saveAndAddAnother')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default AddIngredientModal
