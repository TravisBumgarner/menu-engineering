import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useAppTranslation } from '../../../hooks/useTranslation'

interface EnhancedTableToolbarProps {
  numSelected: number
  onAddRecipe: () => void
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, onAddRecipe } = props
  const { t } = useAppTranslation()

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
          Recipes
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title={t('delete')}>
          <IconButton>🗑️</IconButton>
        </Tooltip>
      ) : (
        <>
          <Tooltip title={t('addRecipe')}>
            <IconButton onClick={onAddRecipe}>➕</IconButton>
          </Tooltip>
        </>
      )}
    </Toolbar>
  )
}

export default EnhancedTableToolbar
