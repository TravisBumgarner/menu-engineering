import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { RecipeDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { activeModalSignal } from '../../../signals'

interface EnhancedTableToolbarProps {
  numSelected: number
  recipe: RecipeDTO
}

function EnhancedTableToolbar({
  numSelected,
  recipe,
}: EnhancedTableToolbarProps) {
  const { t } = useAppTranslation()

  const handleOpenEditRecipeModal = () => {
    activeModalSignal.value = {
      id: 'EDIT_RECIPE_MODAL',
      recipe,
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
        <Tooltip title={t('delete')}>
          <IconButton>🗑️</IconButton>
        </Tooltip>
      ) : (
        <>
          <Tooltip title={t('editRecipe')}>
            <IconButton onClick={handleOpenEditRecipeModal}>
              ✏️ {t('edit')}
            </IconButton>
          </Tooltip>
        </>
      )}
    </Toolbar>
  )
}

export default EnhancedTableToolbar
