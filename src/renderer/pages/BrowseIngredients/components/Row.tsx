import { Collapse, Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useQueryClient } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import * as React from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import type { IngredientDTO } from '../../../../shared/recipe.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import Icon from '../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../../../signals'
import { cellSx, ICON_SIZE } from '../../../styles/tableConsts'

import { formatCurrency, formatDisplayDate, getUnitLabel } from '../../../utilities'
import Ingredient from './Ingredient'

function Row(props: { row: IngredientDTO & { recipeCount: number }; labelId: string }) {
  const { row, labelId } = props
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleOpenEditModal = () => {
    activeModalSignal.value = {
      id: 'EDIT_INGREDIENT_MODAL',
      ingredient: row,
    }
  }

  const handleDeleteIngredient = async () => {
    try {
      const response = await ipcMessenger.invoke(CHANNEL.DB.DELETE_INGREDIENT, {
        id: row.id,
      })

      if (response.success) {
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INGREDIENTS] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INGREDIENT] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
      }
    } catch (error) {
      log.error('Failed to delete ingredient:', error)
    }
  }

  const openConfirmationModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.CONFIRMATION_MODAL,
      title: t('confirmDeleteIngredient'),
      body: t('deleteIngredientConfirmation'),
      confirmationCallback: handleDeleteIngredient,
      showCancel: true,
    }
  }

  return (
    <React.Fragment>
      <TableRow tabIndex={-1} key={row.id}>
        <TableCell sx={cellSx}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(event) => {
              event.stopPropagation()
              setIsOpen(!isOpen)
            }}
          >
            {isOpen ? (
              <Icon size={ICON_SIZE} name="collapseVertical" />
            ) : (
              <Icon size={ICON_SIZE} name="expandVertical" />
            )}
          </IconButton>
        </TableCell>
        <TableCell sx={cellSx} scope="row">
          {formatDisplayDate(row.createdAt)}
        </TableCell>
        <TableCell sx={cellSx} id={labelId} scope="row">
          {row.title}
        </TableCell>
        <TableCell sx={cellSx} align="left">
          {getUnitLabel(row.units, 'plural')}
        </TableCell>
        <TableCell sx={cellSx} align="right">
          {formatCurrency(row.unitCost)}
        </TableCell>
        <TableCell sx={cellSx} align="right">
          {row.recipeCount}
        </TableCell>
        <TableCell sx={cellSx} align="right">
          <Tooltip title={t('editIngredient')}>
            <span>
              <IconButton size="small" title={t('edit')} onClick={handleOpenEditModal}>
                <Icon size={ICON_SIZE} name="edit" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('deleteIngredient')}>
            <span>
              <IconButton size="small" title={t('delete')} onClick={openConfirmationModal}>
                <Icon size={ICON_SIZE} name="delete" />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0, border: 0 }} colSpan={7}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Ingredient id={row.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default Row
