import {
  Box,
  Button,
  Autocomplete as MUIAutocomplete,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Icon from '../../../../../sharedComponents/Icon'

import { useState } from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import { RecipeDTO } from '../../../../../../shared/recipe.types'
import { AllUnits } from '../../../../../../shared/units.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import { SPACING } from '../../../../../styles/consts'

type Value = {
  label: string
  id: string
  type: 'ingredient' | 'sub-recipe'
  units: AllUnits
}

const Autocomplete = ({
  recipe,
  handleAddSubRecipe,
  handleAddIngredient,
  selectedIds,
}: {
  recipe: RecipeDTO
  handleAddSubRecipe: () => void
  handleAddIngredient: () => void
  selectedIds: string[]
}) => {
  const queryClient = useQueryClient()
  const { t } = useAppTranslation()
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.AUTOCOMPLETE],
    queryFn: async (): Promise<Value[]> => {
      const ingredients = await ipcMessenger.invoke(CHANNEL.DB.GET_INGREDIENTS)
      const recipes = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPES)
      return [
        ...ingredients.ingredients.map(i => ({
          label: i.title,
          id: i.id,
          type: 'ingredient' as const,
          units: i.units,
        })),
        ...recipes.recipes.map(r => ({
          label: r.title,
          id: r.id,
          type: 'sub-recipe' as const,
          units: r.units,
        })),
      ]
    },
  })

  const [selectedAutocomplete, setSelectedAutocomplete] = useState<{
    label: string
    id: string
    type: 'ingredient' | 'sub-recipe'
    units: AllUnits
  } | null>(null)

  const {
    isPending: addExistingToRecipeIsLoading,
    mutate: addExistingToRecipe,
  } = useMutation({
    mutationFn: async () => {
      if (!selectedAutocomplete) return
      await ipcMessenger.invoke(CHANNEL.DB.ADD_EXISTING_TO_RECIPE, {
        childId: selectedAutocomplete.id,
        parentId: recipe.id,
        type: selectedAutocomplete.type,
        units: selectedAutocomplete.units,
      })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
      setSelectedAutocomplete(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
      setSelectedAutocomplete(null)
    },
  })

  const handleChange = (event: unknown, value: Value | null) => {
    setSelectedAutocomplete(value)
  }

  return (
    <>
      <MUIAutocomplete
        size="small"
        disablePortal
        options={data || []}
        sx={{
          flexGrow: 1,
          margin: 0,
        }}
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
            <Button
              fullWidth
              onClick={handleAddIngredient}
              variant="outlined"
              size="small"
            >
              {t('addIngredient')}
            </Button>
            <Button
              fullWidth
              onClick={handleAddSubRecipe}
              variant="outlined"
              size="small"
            >
              {t('addSubRecipe')}
            </Button>
          </Box>
        }
        getOptionDisabled={option => selectedIds.includes(option.id)}
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
        renderInput={params => (
          <TextField
            {...params}
            size="small"
            variant="standard"
            label={t('addExisting')}
          />
        )}
      />
      <Button
        variant="outlined"
        size="small"
        disabled={!selectedAutocomplete || addExistingToRecipeIsLoading}
        onClick={() => addExistingToRecipe()}
      >
        {addExistingToRecipeIsLoading ? t('adding') : t('add')}
      </Button>
    </>
  )
}

export default Autocomplete
