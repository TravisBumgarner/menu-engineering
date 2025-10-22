import {
  Box,
  Button,
  Autocomplete as MUIAutocomplete,
  TextField,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { FaThList } from 'react-icons/fa'

import { FaBottleWater } from 'react-icons/fa6'

import { CHANNEL } from '../../../../shared/messages.types'
import { RecipeDTO } from '../../../../shared/recipe.types'
import { QUERY_KEYS } from '../../../consts'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'

type Value = {
  label: string
  id: string
  type: 'ingredient' | 'recipe'
}

const Autocomplete = ({
  recipe,
  handleOnChange,
}: {
  recipe?: RecipeDTO
  handleOnChange: (value: Value | null) => void
}) => {
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
        })),
        ...recipes.recipes.map(r => ({
          label: r.title,
          id: r.id,
          type: 'recipe' as const,
        })),
      ]
    },
  })

  const handleChange = (event: unknown, value: Value | null) => {
    handleOnChange(value)
  }

  const handleAddIngredient = () => {
    activeModalSignal.value = {
      id: 'ADD_INGREDIENT_MODAL',
      recipe: recipe,
    }
  }

  const handleAddRecipe = () => {
    activeModalSignal.value = {
      id: 'ADD_RECIPE_MODAL',
      parentRecipe: recipe,
    }
  }

  return (
    <MUIAutocomplete
      size="small"
      disablePortal
      options={data || []}
      sx={{ width: 300 }}
      onChange={handleChange}
      noOptionsText={
        <Box sx={{ p: 2, color: 'text.secondary', fontStyle: 'italic' }}>
          No ingredients or recipes found
          <Button
            onClick={handleAddIngredient}
            sx={{ ml: 2 }}
            variant="outlined"
            size="small"
          >
            + Ingredient
          </Button>
          <Button
            onClick={handleAddRecipe}
            sx={{ ml: 2 }}
            variant="outlined"
            size="small"
          >
            + Recipe
          </Button>
        </Box>
      }
      renderOption={(props, option) => {
        const { key, ...optionProps } = props
        return (
          <Box key={key} component="li" {...optionProps}>
            {option.type === 'ingredient' && <FaBottleWater />}
            {option.type === 'recipe' && <FaThList />}
            &nbsp; {option.label}
          </Box>
        )
      }}
      renderInput={params => (
        <TextField {...params} label="Add existing ingredient or recipe" />
      )}
    />
  )
}

export default Autocomplete
