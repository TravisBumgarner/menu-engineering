import { Stack, SxProps, Tooltip } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { computed } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import * as React from 'react'
import { type RecipeDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import Photo from '../../../sharedComponents/Photo'
import { activeModalSignal, activeRecipeIdSignal } from '../../../signals'
import { FONT_SIZES, SPACING } from '../../../styles/consts'
import {
  formatCurrency,
  formatDisplayDate,
  getUnitLabel
} from '../../../utilities'
import Recipe from './Recipe'

function RecipeRow({
  row,
  labelId,
}: {
  row: RecipeDTO & { usedInRecipesCount: number, }
  labelId: string
}) {
  useSignals()
  const { t } = useAppTranslation()

  const isOpen = computed(() => activeRecipeIdSignal.value === row.id)

  const opacity = computed(() =>
    activeRecipeIdSignal.value === '' ? 1 : isOpen.value ? 1 : 0.1,
  )

  const handleImageMouseEnter = () => {
    // Placeholder for image hover logic
  }

  const handleImageMouseLeave = () => {
    // Placeholder for image hover logic
  }

  return (
    <React.Fragment>
      <TableRow
        tabIndex={-1}
        key={row.id}
        sx={{
          '& > *': {
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
        <TableCell sx={cellSx} id={labelId} scope="row">
          {formatDisplayDate(row.createdAt)}
        </TableCell>
        <TableCell sx={cellSx} id={labelId} scope="row">
          <Stack direction="row" alignItems="center" spacing={1}>
          {row.photoSrc ? <Photo type="backend" src={row.photoSrc} /> : null}

            <span>{row.title}</span>

          </Stack>
        </TableCell>
        <TableCell
          align="right"
          id={labelId}
          scope="row"
          sx={{ padding: `0 ${SPACING.TINY.PX}` }}
        >
          {formatCurrency((row.cost))}
        </TableCell>
        <TableCell sx={cellSx} align="right">
          {row.produces}
        </TableCell>
        <TableCell sx={cellSx} align="left">
          {getUnitLabel(row.units, 'plural')}
        </TableCell>
        <TableCell
          align="right"
          id={labelId}
          scope="row"
          sx={{ padding: `0 ${SPACING.TINY.PX}` }}
        >
          {formatCurrency((row.cost / row.produces))}
        </TableCell>

        <TableCell sx={cellSx} align="left">
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
        <TableCell sx={cellSx} align="left">
          <Typography variant="body2">
            {row.showInMenu ? t('yes') : t('no')}
          </Typography>
        </TableCell>
        <TableCell sx={cellSx} align="left">
          {row.usedInRecipesCount}
        </TableCell>
        <TableCell sx={cellSx} align="center">
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
        <TableCell sx={cellSx} style={{ padding: 0, border: 0 }} colSpan={11}>
          <Collapse in={isOpen.value} timeout="auto" unmountOnExit>
            <Recipe id={row.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment >
  )
}

const cellSx: SxProps = {
  fontSize: FONT_SIZES.MEDIUM.PX,
}

export default RecipeRow
