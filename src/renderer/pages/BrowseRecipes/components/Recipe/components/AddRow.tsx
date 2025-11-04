import { Button, Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { RecipeDTO } from '../../../../../../shared/recipe.types'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import Icon from '../../../../../sharedComponents/Icon'
import { SPACING } from '../../../../../styles/consts'
// import AddIngredientRow from './AddIngredientRow'
// import AddSubRecipeRow from './AddSubRecipeRow'
import { MODAL_ID } from '../../../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../../../signals'
import Autocomplete from './Autocomplete'
import { ADD_ROW_HEIGHT } from './consts'

// type RowMode = 'default' | 'addIngredient' | 'addSubRecipe'

const AddRow = ({
  recipe,
  selectedIds,
}: {
  recipe: RecipeDTO
  selectedIds: string[]
}) => {
  const { t } = useAppTranslation()
  // const [rowMode, setRowMode] = useState<RowMode>('default')

  // const handleAddIngredient = () => {
  //   setRowMode('addIngredient')
  // }

  // const handleAddSubRecipe = () => {
  //   setRowMode('addSubRecipe')
  // }

  // const handleCancel = () => {
  //   setRowMode('default')
  // }

  // Render different rows based on mode
  // if (rowMode === 'addIngredient') {
  //   return <AddIngredientRow recipe={recipe} onCancel={handleCancel} />
  // }

  // if (rowMode === 'addSubRecipe') {
  //   return <AddSubRecipeRow parentRecipe={recipe} onCancel={handleCancel} />
  // }

  const handleAddIngredient = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_INGREDIENT_MODAL,
      recipe,
    }
  }

  const handleAddSubRecipe = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_RECIPE_MODAL,
      parentRecipe: recipe,
    }
  }

  // Default row with buttons
  return (
    <TableRow sx={{ height: ADD_ROW_HEIGHT }}>
      <TableCell colSpan={8}>
        <Box
          sx={{
            display: 'flex',
            gap: SPACING.MEDIUM.PX,
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexBasis: 'calc(100%/3)', display: 'flex', gap: 1 }}>
            <Autocomplete
              selectedIds={selectedIds}
              handleAddSubRecipe={handleAddSubRecipe}
              handleAddIngredient={handleAddIngredient}
              recipe={recipe}
            />
          </Box>
          <Tooltip title={t('addIngredient')}>
            <Button
              sx={{ flexBasis: 'calc(100%/3)' }}
              variant="outlined"
              onClick={handleAddIngredient}
              startIcon={<Icon name="add" />}
            >
              {t('ingredient')}
            </Button>
          </Tooltip>
          <Tooltip title={t('addRecipe')}>
            <Button
              sx={{ flexBasis: 'calc(100%/3)' }}
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
