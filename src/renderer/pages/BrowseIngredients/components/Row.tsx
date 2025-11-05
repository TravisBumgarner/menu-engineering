import { Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import * as React from 'react'
import { IngredientDTO } from '../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../shared/units.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import Icon from '../../../sharedComponents/Icon'
import { activeModalSignal } from '../../../signals'
import { formatDisplayDate } from '../../../utilities'

function IngredientRow(props: { row: IngredientDTO; labelId: string }) {
  const { row, labelId } = props
  // const [open, setOpen] = React.useState(false)
  const { t } = useAppTranslation()

  const handleOpenEditModal = () => {
    activeModalSignal.value = {
      id: 'EDIT_INGREDIENT_MODAL',
      ingredient: row,
    }
  }

  return (
    <React.Fragment>
      <TableRow
        hover
        tabIndex={-1}
        key={row.id}
        sx={{ '& > *': { borderBottom: 'unset' } }}
      >
        <TableCell scope="row" padding="none">
          {formatDisplayDate(row.createdAt)}
        </TableCell>
        <TableCell id={labelId} scope="row" padding="none">
          {row.title}
        </TableCell>
        <TableCell align="left">
          {t(row.units as keyof typeof ALL_UNITS)}
        </TableCell>
        <TableCell align="right">{row.unitCost}</TableCell>
        <TableCell align="left">
          <Tooltip title={t('editIngredient')}>
            <IconButton
              size="small"
              title={t('edit')}
              onClick={handleOpenEditModal}
            >
              <Icon name="edit" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default IngredientRow
