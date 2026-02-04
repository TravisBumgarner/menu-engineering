import { Box, Button, Autocomplete as MUIAutocomplete, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import type { RecipeDTO } from '../../../../../../shared/recipe.types'
import type { AllUnits, UnitPreferences } from '../../../../../../shared/units.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import { activeModalSignal } from '../../../../../signals'
import { SPACING } from '../../../../../styles/consts'
import { getFirstEnabledUnit, getFromLocalStorage, LOCAL_STORAGE_KEYS } from '../../../../../utilities'
import Icon from '../../../../Icon'
import { DEFAULT_UNIT_PREFERENCES } from '../../SettingsModal/components/TabUnitPreferences'
import RecipeDetails from './RecipeDetails'

type Value = {
  label: string
  id: string
  type: 'ingredient' | 'sub-recipe'
  units: AllUnits
}

const Autocomplete = ({
  recipe,
  setTab,
}: {
  recipe: RecipeDTO
  setTab: (tab: 'addIngredient' | 'addRecipe') => void
}) => {
  const queryClient = useQueryClient()
  const [recipeQuantity, setRecipeQuantity] = useState<number>(0)
  const { t } = useAppTranslation()
  const { data: autocompleteData } = useQuery({
    queryKey: [QUERY_KEYS.AUTOCOMPLETE],
    queryFn: async (): Promise<Value[]> => {
      const ingredients = await ipcMessenger.invoke(CHANNEL.DB.GET_INGREDIENTS)
      const recipes = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPES)
      return [
        ...ingredients.ingredients.map((i) => ({
          label: i.title,
          id: i.id,
          type: 'ingredient' as const,
          units: i.units,
        })),
        ...recipes.recipes.map((r) => ({
          label: r.title,
          id: r.id,
          type: 'sub-recipe' as const,
          units: r.units,
        })),
      ].sort((a, b) => a.label.localeCompare(b.label))
    },
  })

  const { data: recipeData } = useQuery({
    queryKey: [QUERY_KEYS.RECIPE, recipe.id],
    queryFn: async () => {
      if (!recipe.id) throw new Error(t('recipeNotFound'))

      const response = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, {
        id: recipe.id,
      })
      return response
    },
  })

  const existingRecipeComponentIds = useMemo(() => {
    if (recipeData) {
      return recipeData.ingredients
        .map((i) => i.id)
        .concat(recipeData?.subRecipes.map((s) => s.id))
        .concat([recipe.id])
    }
    return []
  }, [recipeData, recipe])

  const handleClose = () => {
    activeModalSignal.value = null
  }

  const [selectedAutocomplete, setSelectedAutocomplete] = useState<Value | null>(null)

  const { isPending: addExistingToRecipeIsLoading, mutate: addExistingToRecipe } = useMutation({
    mutationFn: async (shouldClose: boolean) => {
      if (!selectedAutocomplete) {
        // Always return a Promise with the correct shape
        return Promise.resolve({ success: false, shouldClose })
      }
      const result = await ipcMessenger.invoke(CHANNEL.DB.ADD_EXISTING_TO_RECIPE, {
        childId: selectedAutocomplete.id,
        parentId: recipe.id,
        type: selectedAutocomplete.type,
        units: selectedAutocomplete.units,
        quantity: recipeQuantity,
      })
      return { ...result, shouldClose }
    },
    onSuccess: async (result) => {
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        setSelectedAutocomplete(null)

        if (result.shouldClose) {
          activeModalSignal.value = null
        } else {
          setSelectedAutocomplete(null)
          setRecipeQuantity(0)
        }
      }
    },
  })

  const handleChange = (_event: unknown, value: Value | null) => {
    setSelectedAutocomplete(value)
  }

  return (
    <Stack spacing={SPACING.MEDIUM.PX} sx={{ flexGrow: 1, justifyContent: 'space-between' }}>
      <Stack spacing={SPACING.MEDIUM.PX} sx={{ flexGrow: 1 }}>
        <MUIAutocomplete
          key={autocompleteData ? 'loaded' : 'loading'}
          size="small"
          disablePortal
          options={autocompleteData || []}
          sx={{
            margin: 0,
          }}
          value={selectedAutocomplete}
          onChange={handleChange}
          noOptionsText={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: SPACING.TINY.PX,
              }}
            >
              <Typography>No ingredients or recipes found</Typography>
              <Button fullWidth onClick={() => setTab('addIngredient')} variant="outlined" size="small">
                {t('addIngredient')}
              </Button>
              <Button fullWidth onClick={() => setTab('addRecipe')} variant="outlined" size="small">
                {t('addSubRecipe')}
              </Button>
            </Box>
          }
          getOptionDisabled={(option) => existingRecipeComponentIds.includes(option.id)}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props
            return (
              <Box key={key} component="li" {...optionProps}>
                {option.type === 'ingredient' && <Icon name="ingredient" />}
                {option.type === 'sub-recipe' && <Icon name="recipe" />}
                &nbsp; {option.label}
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField {...params} size="small" variant="standard" placeholder={t('addExisting')} />
          )}
        />
        <RecipeDetails
          units={
            selectedAutocomplete?.units ||
            getFirstEnabledUnit(
              getFromLocalStorage<UnitPreferences>(LOCAL_STORAGE_KEYS.UNIT_PREFERENCES_KEY, DEFAULT_UNIT_PREFERENCES),
            )
          }
          setQuantity={setRecipeQuantity}
          quantity={recipeQuantity}
        />
      </Stack>
      <Stack direction="row" spacing={SPACING.SMALL.PX} justifyContent="flex-end">
        <Button onClick={handleClose} variant="outlined" type="button" size="small">
          {t('close')}
        </Button>
        <Button
          variant="outlined"
          size="small"
          disabled={!selectedAutocomplete || addExistingToRecipeIsLoading}
          onClick={() => addExistingToRecipe(true)}
        >
          {addExistingToRecipeIsLoading ? t('saving') : t('save')}
        </Button>{' '}
        <Button
          variant="contained"
          size="small"
          disabled={!selectedAutocomplete || addExistingToRecipeIsLoading}
          onClick={() => addExistingToRecipe(false)}
        >
          {addExistingToRecipeIsLoading ? t('saving') : t('saveAndAddAnother')}
        </Button>
      </Stack>
    </Stack>
  )
}

export default Autocomplete
