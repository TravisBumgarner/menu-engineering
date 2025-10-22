import { Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { MdEdit } from 'react-icons/md'
import { IngredientDTO } from '../../../../shared/recipe.types'
import { ALL_UNITS } from '../../../../shared/units.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { activeModalSignal } from '../../../signals'

function IngredientRow(props: {
  row: IngredientDTO
  isItemSelected: boolean
  labelId: string
  onClick: (event: React.MouseEvent<unknown>, id: string) => void
}) {
  const { row, isItemSelected, labelId, onClick } = props
  const [open, setOpen] = React.useState(false)
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
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={row.id}
        selected={isItemSelected}
        sx={{ '& > *': { borderBottom: 'unset' } }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={event => {
              event.stopPropagation()
              setOpen(!open)
            }}
          >
            {open ? '🔼' : '🔽'}
          </IconButton>
        </TableCell>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isItemSelected}
            onClick={event => onClick(event, row.id)}
            inputProps={{
              'aria-labelledby': labelId,
            }}
          />
        </TableCell>
        <TableCell component="th" id={labelId} scope="row" padding="none">
          {row.title}
        </TableCell>
        <TableCell align="right">{row.quantity}</TableCell>
        <TableCell align="left">
          {t(row.units as keyof typeof ALL_UNITS)}
        </TableCell>
        <TableCell align="right">{row.cost}</TableCell>
        <TableCell align="left">
          <Tooltip title={t('editIngredient')}>
            <IconButton
              size="small"
              title={t('edit')}
              onClick={handleOpenEditModal}
            >
              <MdEdit size={20} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Ingredient Details
              </Typography>
              <Table size="small" aria-label="ingredient details">
                <TableBody>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('id')}
                    </TableCell>
                    <TableCell>{row.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('created')}
                    </TableCell>
                    <TableCell>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('updated')}
                    </TableCell>
                    <TableCell>
                      {new Date(row.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {t('notes')}
                    </TableCell>
                    <TableCell>
                      {row.notes || <em>{t('noNotes')}</em>}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default IngredientRow
