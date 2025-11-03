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
import AddIngredientRow from './AddIngredientRow'
import AddSubRecipeRow from './AddSubRecipeRow'
import Autocomplete from './Autocomplete'

type RowMode = 'default' | 'addIngredient' | 'addSubRecipe'

const AddRow = ({ recipe }: { recipe: RecipeDTO }) => {
  const queryClient = useQueryClient()
  const { t } = useAppTranslation()
  const [rowMode, setRowMode] = useState<RowMode>('default')

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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
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

  const handleAddIngredient = () => {
    setRowMode('addIngredient')
  }

  const handleAddSubRecipe = () => {
    setRowMode('addSubRecipe')
  }

  const handleCancel = () => {
    setRowMode('default')
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

  // Render different rows based on mode
  if (rowMode === 'addIngredient') {
    return <AddIngredientRow recipe={recipe} onCancel={handleCancel} />
  }

  if (rowMode === 'addSubRecipe') {
    return <AddSubRecipeRow parentRecipe={recipe} onCancel={handleCancel} />
  }

  // Default row with buttons
  return (
    <TableRow>
      <TableCell colSpan={6}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            borderRadius: 1,
            padding: 2,
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
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
              onClick={handleAddIngredient}
              startIcon={<Icon name="add" />}
            >
              {t('ingredient')}
            </Button>
          </Tooltip>
          <Tooltip title={t('addRecipe')}>
            <Button
              sx={{ flexGrow: 1 }}
              variant="outlined"
              onClick={handleAddSubRecipe}
              startIcon={<Icon name="add" />}
            >
              {t('recipe')}
            </Button>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  )
}

export default AddRow
