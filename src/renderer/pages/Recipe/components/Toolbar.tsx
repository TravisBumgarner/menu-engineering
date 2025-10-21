import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../signals'

interface EnhancedTableToolbarProps {
  numSelected: number
  recipeId: string
  title: string
}

function EnhancedTableToolbar({
  numSelected,
  recipeId,
  title,
}: EnhancedTableToolbarProps) {
  const handleOpenAddIngredientModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_INGREDIENT_MODAL,
      recipeId: '',
    }
  }

  const handleOpenAddRecipeModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.ADD_RECIPE_MODAL,
      parentRecipe: { recipeId, title },
    }
  }

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: theme =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity,
            ),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Ingredients
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>🗑️</IconButton>
        </Tooltip>
      ) : (
        <>
          <Tooltip title="Add Ingredient">
            <IconButton onClick={handleOpenAddIngredientModal}>
              ➕ Ingredient
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Recipe">
            <IconButton onClick={handleOpenAddRecipeModal}>
              ➕ Recipe
            </IconButton>
          </Tooltip>
        </>
      )}
    </Toolbar>
  )
}

export default EnhancedTableToolbar
