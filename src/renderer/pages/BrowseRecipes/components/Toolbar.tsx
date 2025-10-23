import { Button } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'

interface EnhancedTableToolbarProps {
  onAddRecipe: () => void
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { onAddRecipe } = props
  const { t } = useAppTranslation()

  return (
    <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Tooltip title={t('addRecipe')}>
        <Button variant="outlined" onClick={onAddRecipe}>
          <Icon name="add" /> Add Recipe
        </Button>
      </Tooltip>
    </Toolbar>
  )
}

export default EnhancedTableToolbar
