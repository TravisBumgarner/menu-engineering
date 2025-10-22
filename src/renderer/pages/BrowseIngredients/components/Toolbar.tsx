import { Button } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'

interface EnhancedTableToolbarProps {
  onAddIngredient: () => void
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { onAddIngredient } = props
  const { t } = useAppTranslation()

  return (
    <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Tooltip title={t('addIngredient')}>
        <Button variant="outlined" onClick={onAddIngredient}>
          <Icon name="add" /> {t('addIngredient')}
        </Button>
      </Tooltip>
    </Toolbar>
  )
}

export default EnhancedTableToolbar
