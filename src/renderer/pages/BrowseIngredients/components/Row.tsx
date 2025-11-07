import { Collapse, Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import * as React from 'react'
import { IngredientDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { formatDisplayDate, getUnitLabel } from '../../../utilities'
import Ingredient from './Ingredient'

function Row(props: {
  row: IngredientDTO & { recipeCount: number }
  labelId: string
}) {
  const { row, labelId } = props
  const { t } = useAppTranslation()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleOpenEditModal = () => {
    activeModalSignal.value = {
      id: 'EDIT_INGREDIENT_MODAL',
      ingredient: row,
    }
  }

  return (
    <React.Fragment>
      <TableRow tabIndex={-1} key={row.id}>
        <TableCell sx={{ padding: `0 ${SPACING.SMALL.PX}` }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={event => {
              event.stopPropagation()
              setIsOpen(!isOpen)
            }}
          >
            {isOpen ? (
              <Icon name="collapseVertical" />
            ) : (
              <Icon name="expandVertical" />
            )}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{ padding: `0 ${SPACING.TINY.PX}` }}
          scope="row"
          padding="none"
        >
          {formatDisplayDate(row.createdAt)}
        </TableCell>
        <TableCell
          sx={{ padding: `0 ${SPACING.TINY.PX}` }}
          id={labelId}
          scope="row"
          padding="none"
        >
          {row.title}
        </TableCell>
        <TableCell sx={{ padding: `0 ${SPACING.TINY.PX}` }} align="left">
          {getUnitLabel(row.units, 'plural')}
        </TableCell>
        <TableCell sx={{ padding: `0 ${SPACING.TINY.PX}` }} align="right">
          {row.unitCost}
        </TableCell>
        <TableCell sx={{ padding: `0 ${SPACING.TINY.PX}` }} align="left">
          {row.recipeCount} {row.recipeCount === 1 ? t('recipe') : t('recipes')}
        </TableCell>
        <TableCell sx={{ padding: `0 ${SPACING.TINY.PX}` }} align="left">
          <Tooltip title={t('editIngredient')}>
            <span>
              <IconButton
                size="small"
                title={t('edit')}
                onClick={handleOpenEditModal}
              >
                <Icon name="edit" />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0, border: 0 }} colSpan={9}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Ingredient id={row.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default Row
