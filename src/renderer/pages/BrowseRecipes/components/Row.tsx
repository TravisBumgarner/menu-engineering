import { Tooltip } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { type RecipeDTO } from '../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../shared/units.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import Recipe from './Recipe'

function RecipeRow({
  row,
  labelId,
  focusedRecipeId,
  setFocusedRecipeId,
}: {
  row: RecipeDTO
  labelId: string
  focusedRecipeId: string
  setFocusedRecipeId: (id: string) => void
}) {
  const navigate = useNavigate()
  const { t } = useAppTranslation()

  const opacity = React.useMemo(() => {
    if (focusedRecipeId === '') {
      return 1
    }
    return row.id === focusedRecipeId ? 1 : 0.1
  }, [focusedRecipeId, row.id])

  return (
    <React.Fragment>
      <TableRow
        hover
        tabIndex={-1}
        key={row.id}
        sx={{
          '& > *': {
            borderBottom: 'unset',
            opacity,
          },
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={event => {
              event.stopPropagation()
              setFocusedRecipeId(row.id === focusedRecipeId ? '' : row.id)
            }}
          >
            {focusedRecipeId === row.id ? (
              <Icon name="collapseVertical" />
            ) : (
              <Icon name="expandVertical" />
            )}
          </IconButton>
        </TableCell>
        <TableCell component="th" id={labelId} scope="row" padding="none">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </TableCell>
        <TableCell component="th" id={labelId} scope="row" padding="none">
          {row.title}
        </TableCell>
        <TableCell align="right">{row.produces}</TableCell>
        <TableCell align="left">
          {t(row.units as keyof typeof ALL_UNITS)}
        </TableCell>
        <TableCell align="left">
          <Typography
            variant="body2"
            sx={{
              width: '100%',
              textAlign: 'center',
              padding: `${SPACING.TINY.PX} ${SPACING.SMALL.PX}`,
              borderRadius: 1,
              bgcolor:
                row.status === 'published'
                  ? 'success.light'
                  : row.status === 'draft'
                    ? 'warning.light'
                    : 'error.light',
              color:
                row.status === 'published'
                  ? 'success.contrastText'
                  : row.status === 'draft'
                    ? 'warning.contrastText'
                    : 'error.contrastText',
            }}
          >
            {t(row.status)}
          </Typography>
        </TableCell>
        <TableCell align="left">
          {row.showInMenu ? (
            <Icon name="checkbox" />
          ) : (
            <Icon name="checkboxOutline" />
          )}
        </TableCell>
        <TableCell align="left">
          <Tooltip title={t('editRecipeDetails')}>
            <IconButton onClick={() => navigate(`/recipe/${row.id}`)}>
              <Icon name="details" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('editRecipe')}>
            <IconButton
              onClick={() =>
                (activeModalSignal.value = {
                  id: MODAL_ID.EDIT_RECIPE_MODAL,
                  recipe: row,
                })
              }
            >
              <Icon name="edit" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8}>
          <Collapse
            in={focusedRecipeId === row.id}
            timeout="auto"
            unmountOnExit
          >
            <Recipe id={row.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default RecipeRow
