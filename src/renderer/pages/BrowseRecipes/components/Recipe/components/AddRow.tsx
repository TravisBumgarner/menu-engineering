import { Button, Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { CHANNEL } from '../../../../../../shared/messages.types'
import { RecipeDTO } from '../../../../../../shared/recipe.types'
import { QUERY_KEYS } from '../../../../../consts'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import ipcMessenger from '../../../../../ipcMessenger'
import Icon from '../../../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../../../signals'
import { SPACING } from '../../../../../styles/consts'
import Autocomplete from './Autocomplete'

const AddRow = ({ recipe }: { recipe: RecipeDTO }) => {
  const queryClient = useQueryClient()
  const { t } = useAppTranslation()

  const [selectedAutocomplete, setSelectedAutocomplete] = useState<{
    label: string
    id: string
    type: 'ingredient' | 'recipe'
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
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
      setSelectedAutocomplete(null)
    },
  })

  const handleOpenAddIngredientModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_INGREDIENT_MODAL,
      recipe,
    }
  }

  const handleOpenAddRecipeModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_RECIPE_MODAL,
      parentRecipe: recipe,
    }
  }

  const handleAutocompleteSelect = (
    value: {
      label: string
      id: string
      type: 'ingredient' | 'recipe'
    } | null,
  ) => {
    setSelectedAutocomplete(value)
  }

  return (
    <TableRow>
      <TableCell colSpan={6}>
        <Box
          sx={{
            display: 'flex',
            gap: SPACING.LARGE.PX,
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', gap: SPACING.TINY.PX }}>
            <Autocomplete
              sx={{ flexGrow: 1 }}
              handleOnChange={handleAutocompleteSelect}
            />
            <Button
              variant="outlined"
              disabled={!selectedAutocomplete || addExistingToRecipeIsLoading}
              onClick={() => addExistingToRecipe()}
            >
              {addExistingToRecipeIsLoading ? t('adding') : t('add')}
            </Button>
          </Box>
          <Tooltip title={t('addIngredient')}>
            <Button
              sx={{ flexGrow: 1 }}
              variant="outlined"
              onClick={handleOpenAddIngredientModal}
            >
              <Icon name="add" /> {t('ingredient')}
            </Button>
          </Tooltip>
          <Tooltip title={t('addRecipe')}>
            <Button
              sx={{ flexGrow: 1 }}
              variant="outlined"
              onClick={handleOpenAddRecipeModal}
            >
              <Icon name="add" /> {t('recipe')}
            </Button>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  )
}

export default AddRow
