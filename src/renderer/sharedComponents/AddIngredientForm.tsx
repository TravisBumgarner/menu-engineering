import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { CHANNEL } from '../../shared/messages.types'
import { NewIngredientDTO, RecipeDTO } from '../../shared/recipe.types'
import { ALL_UNITS, AllUnits } from '../../shared/units.types'
import { QUERY_KEYS } from '../consts'
import { useAppTranslation } from '../hooks/useTranslation'
import ipcMessenger from '../ipcMessenger'
import { activeModalSignal } from '../signals'
import { SPACING } from '../styles/consts'
import { getUnitLabel } from '../utilities'


type FormData = {
    title: string
    quantity: number
    units: AllUnits
    cost: number
}

const AddIngredientForm = ({ recipe }: { recipe?: RecipeDTO }) => {
    const { t } = useAppTranslation()
    const queryClient = useQueryClient()
    const [ingredientFormData, setIngredientFormData] = useState<FormData>({
        title: '',
        quantity: 1,
        units: ALL_UNITS.cups,
        cost: 0,
    })

    const addIngredientMutation = useMutation({
        mutationFn: ({
            newIngredient,
            recipeId,
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
                        recipeId,
                        units: newIngredient.units,
                    },
                })
                .then(result => ({ ...result, shouldClose })),
        onSuccess: result => {
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
                        units: ALL_UNITS.cups,
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
            recipeId: recipe?.id,
            shouldClose,
        })
    }

    const handleInputChange =
        (field: string) =>
            (
                e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } },
            ) => {
                const value =
                    field === 'quantity' || field === 'unitCost'
                        ? Number(e.target.value)
                        : e.target.value
                setIngredientFormData(prev => ({
                    ...prev,
                    [field]: value,
                }))
            }

    const preventSubmit =
        addIngredientMutation.isPending ||
        !ingredientFormData.title.trim() ||
        ingredientFormData.quantity <= 0 ||
        !ingredientFormData.units.trim()

    return (
        <Box component="form">
            <Stack spacing={SPACING.MEDIUM.PX}>
                <TextField
                    size="small"
                    label={t('title')}
                    value={ingredientFormData.title}
                    onChange={handleInputChange('title')}
                    required
                    fullWidth
                    placeholder={t('ingredientNamePlaceholder')}
                />

                <Stack
                    spacing={SPACING.SMALL.PX}
                    direction="row"
                    sx={{ alignItems: 'center' }}
                >
                    <TextField
                        size="small"
                        label={t('cost')}
                        type="number"
                        value={ingredientFormData.cost}
                        onChange={handleInputChange('cost')}
                        required
                        sx={{ width: '100px' }}
                        slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                    />

                    <Typography>/</Typography>

                    <TextField
                        size="small"
                        label={t('quantity')}
                        type="number"
                        value={ingredientFormData.quantity}
                        onChange={handleInputChange('quantity')}
                        required
                        sx={{ width: '100px' }}
                        slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                    />
                    <FormControl size="small" required sx={{ width: '150px' }}>
                        <InputLabel>{t('units')}</InputLabel>
                        <Select
                            value={ingredientFormData.units}
                            onChange={e =>
                                handleInputChange('units')(
                                    e as React.ChangeEvent<HTMLInputElement>,
                                )
                            }
                            label={t('units')}
                        >
                            {Object.entries(ALL_UNITS).map(([key, value]) => (
                                <MenuItem key={key} value={value}>
                                    {getUnitLabel(value, 2)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography>=</Typography>

                    <Typography>
                        $
                        {(ingredientFormData.cost / ingredientFormData.quantity).toFixed(
                            2,
                        )}
                        /{' '}
                        {getUnitLabel(
                            ingredientFormData.units,
                            ingredientFormData.quantity,
                        )}
                    </Typography>
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
                        variant="outlined"
                        type="button"
                        onClick={handleSubmit(true)}
                        disabled={preventSubmit}
                    >
                        {addIngredientMutation.isPending ? t('saving') : t('save')}
                    </Button>
                    <Button
                        variant="contained"
                        type="button"
                        onClick={handleSubmit(false)}
                        disabled={preventSubmit}
                    >
                        {addIngredientMutation.isPending
                            ? t('saving')
                            : t('saveAndAddAnother')}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    )
}

export default AddIngredientForm