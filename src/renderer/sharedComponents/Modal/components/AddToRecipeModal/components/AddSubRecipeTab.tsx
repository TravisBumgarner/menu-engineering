import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import {
    NewRecipeDTO,
    RECIPE_STATUS,
    RecipeDTO
} from '../../../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../../../shared/units.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import { activeModalSignal } from '../../../../../signals'
import { SPACING } from '../../../../../styles/consts'
import { getUnitLabel } from '../../../../../utilities'
import RecipeDetails from './RecipeDetails'

const AddRecipeForm = ({ parentRecipe }: { parentRecipe: RecipeDTO }) => {
    const { t } = useAppTranslation()
    const queryClient = useQueryClient()
    const [recipeQuantity, setRecipeQuantity] = useState<number>(0)


    const [formData, setFormData] = useState<NewRecipeDTO>({
        title: '',
        produces: 0,
        units: ALL_UNITS.units,
        status: RECIPE_STATUS.draft,
        showInMenu: false,
    })

    const handleClose = () => {
        activeModalSignal.value = null
    }

    const addSubRecipeMutation = useMutation({
        mutationFn: (args: { newRecipe: NewRecipeDTO; parentRecipeId: string; shouldClose: boolean }) =>
            ipcMessenger.invoke(CHANNEL.DB.ADD_SUB_RECIPE, {
                payload: {
                    newRecipe: args.newRecipe,
                    parentRecipeId: args.parentRecipeId,
                    units: args.newRecipe.units,
                }
            }).then(result => ({ ...result, shouldClose: args.shouldClose })),
        onSuccess: async result => {
            if (result.success) {
                // Invalidate and refetch queries
                await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
                await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTOCOMPLETE] })

                if (!result.shouldClose) {
                    setFormData({
                        title: '',
                        produces: 0,
                        units: ALL_UNITS.units,
                        status: RECIPE_STATUS.draft,
                        showInMenu: false,
                    })
                    setRecipeQuantity(0)
                } else {
                    activeModalSignal.value = null
                }
            } else {
                alert(t('failedToAddSubRecipe'))
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
        addSubRecipeMutation.isPending ||
        !formData.title.trim() ||
        !formData.units.trim() ||
        formData.produces <= 0

    return (
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1, }}>

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
                            onChange={e =>
                                handleInputChange('units')(
                                    e as React.ChangeEvent<HTMLInputElement>,
                                )
                            }
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
                <Typography
                    sx={{ marginTop: '0 !important' }}
                    variant="caption"
                    color="textSecondary"
                >
                    {t('unitsHelpText')}
                </Typography>
                <FormControl size="small" fullWidth required>
                    <InputLabel>{t('status')}</InputLabel>
                    <Select
                        value={formData.status}
                        onChange={handleInputChange('status')}
                        label={t('status')}
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

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.showInMenu}
                            onChange={handleCheckboxChange('showInMenu')}
                        />
                    }
                    label={t('showInMenu')}
                />
                <RecipeDetails units={formData.units} setQuantity={setRecipeQuantity} quantity={recipeQuantity} />
            </Stack>
            <Stack direction="row" spacing={SPACING.SMALL.PX} justifyContent="flex-end">
                <Button size="small" onClick={handleClose} variant="outlined" type="button">
                    {t('close')}
                </Button>
                <Button size="small" variant="outlined" type="submit" disabled={preventSubmit} onClick={handleSubmit(true)}>
                    {addSubRecipeMutation.isPending ? t('saving') : t('save')}
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    type="button"
                    onClick={handleSubmit(false)}
                    disabled={preventSubmit}
                >
                    {addSubRecipeMutation.isPending
                        ? t('saving')
                        : t('saveAndAddAnother')}
                </Button>
            </Stack>


        </Box >
    )
}

export default AddRecipeForm
