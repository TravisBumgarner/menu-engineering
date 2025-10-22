import { Button } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import { RecipeDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'
import { activeModalSignal } from '../../../signals'

interface EnhancedTableToolbarProps {
  recipe: RecipeDTO
}

function EnhancedTableToolbar({ recipe }: EnhancedTableToolbarProps) {
  const { t } = useAppTranslation()

  const handleOpenEditRecipeModal = () => {
    activeModalSignal.value = {
      id: 'EDIT_RECIPE_MODAL',
      recipe,
    }
  }

  return (
    <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Tooltip title={t('editRecipe')}>
        <Button variant="contained" onClick={handleOpenEditRecipeModal}>
          <Icon name="edit" /> {t('edit')}
        </Button>
      </Tooltip>
    </Toolbar>
  )
}

export default EnhancedTableToolbar
