import { Tooltip } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { computed } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { type RecipeDTO } from '../../../../shared/recipe.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import Icon from '../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal, activeRecipeIdSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import {
  formatCurrency,
  formatDisplayDate,
  getUnitLabel,
} from '../../../utilities'
import Recipe from './Recipe'

function RecipeRow({
  row,
  labelId,
}: {
  row: RecipeDTO & { usedInRecipesCount: number }
  labelId: string
}) {
  useSignals()
  const { t } = useAppTranslation()

  const isOpen = computed(() => activeRecipeIdSignal.value === row.id)

  const opacity = computed(() =>
    activeRecipeIdSignal.value === '' ? 1 : isOpen.value ? 1 : 0.1,
  )

  const recipeCostQuery = useQuery({
    queryKey: [QUERY_KEYS.RECIPE_COST, row.id],
    queryFn: async () => {
      const result = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE_COST, {
        id: row.id,
      })
      return result
    },
  })

  return (
    <React.Fragment>
      <TableRow
        tabIndex={-1}
        key={row.id}
        sx={{
          '& > *': {
            borderBottom: 'unset',
            opacity: opacity.value,
            fontWeight: 900,
          },
        }}
      >
        <TableCell sx={{ padding: `0 ${SPACING.SMALL.PX}` }}>
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
        <TableCell
          id={labelId}
          scope="row"
          sx={{ padding: `0 ${SPACING.SMALL.PX}` }}
        >
          {formatDisplayDate(row.createdAt)}
        </TableCell>
        <TableCell
          id={labelId}
          scope="row"
          sx={{ padding: `0 ${SPACING.SMALL.PX}` }}
        >
          {row.title} {row.id.slice(0, 6)}
        </TableCell>
        <TableCell
          align="right"
          id={labelId}
          scope="row"
          sx={{ padding: `0 ${SPACING.TINY.PX}` }}
        >
          {recipeCostQuery.data?.success
            ? formatCurrency(recipeCostQuery.data.cost)
            : 'N/A'}
        </TableCell>
        <TableCell sx={{ padding: `0 ${SPACING.SMALL.PX}` }} align="right">
          {row.produces}
        </TableCell>
        <TableCell sx={{ padding: `0 ${SPACING.SMALL.PX}` }} align="left">
          {getUnitLabel(row.units, 'plural')}
        </TableCell>
        <TableCell align="left" sx={{ padding: `0 ${SPACING.SMALL.PX}` }}>
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
        <TableCell align="left" sx={{ padding: `0 ${SPACING.SMALL.PX}` }}>
          <Typography variant="body2">
            {row.showInMenu ? t('yes') : t('no')}
          </Typography>
        </TableCell>
        <TableCell align="left" sx={{ padding: `0 ${SPACING.SMALL.PX}` }}>
          {row.usedInRecipesCount}
        </TableCell>
        <TableCell align="center" sx={{ padding: `0 ${SPACING.SMALL.PX}` }}>
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
        <TableCell style={{ padding: 0, border: 0 }} colSpan={10}>
          <Collapse in={isOpen.value} timeout="auto" unmountOnExit>
            <Recipe id={row.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default RecipeRow
