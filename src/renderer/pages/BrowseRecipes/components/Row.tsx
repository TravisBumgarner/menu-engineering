import { Tooltip } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { computed } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import * as React from 'react'
import { type RecipeDTO } from '../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../shared/units.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal, activeRecipeIdSignal } from '../../../signals'
import { PALETTE, SPACING } from '../../../styles/consts'
import { formatDisplayDate } from '../../../utilities'
import Recipe from './Recipe'

function RecipeRow({ row, labelId }: { row: RecipeDTO; labelId: string }) {
  useSignals()
  const { t } = useAppTranslation()

  const isOpen = computed(() => activeRecipeIdSignal.value === row.id)

  const opacity = computed(() =>
    activeRecipeIdSignal.value === '' ? 1 : isOpen.value ? 1 : 0.1,
  )

  return (
    <React.Fragment>
      <TableRow
        hover
        tabIndex={-1}
        key={row.id}
        sx={{
          backgroundColor: isOpen.value ? PALETTE.grayscale[100] : 'inherit',
          '& > *': {
            borderBottom: 'unset',
            opacity: opacity.value,
          },
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={event => {
              event.stopPropagation()
              activeRecipeIdSignal.value = isOpen.value ? '' : row.id
            }}
          >
            {isOpen.value ? (
              <Icon name="collapseVertical" />
            ) : (
              <Icon name="expandVertical" />
            )}
          </IconButton>
        </TableCell>
        <TableCell component="th" id={labelId} scope="row" padding="none">
          {formatDisplayDate(row.createdAt)}
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
        <TableCell align="center">
          {row.showInMenu ? (
            <Icon name="checkbox" />
          ) : (
            <Icon name="checkboxOutline" />
          )}
        </TableCell>
        <TableCell align="center">
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
        <TableCell style={{ padding: 0, border: 0 }} colSpan={8}>
          <Collapse in={isOpen.value} timeout="auto" unmountOnExit>
            <Recipe id={row.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default RecipeRow
