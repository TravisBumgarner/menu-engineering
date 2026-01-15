import { Stack, type SxProps, Tooltip } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { computed } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { useQueryClient } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import * as React from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import type { RecipeDTO } from '../../../../shared/recipe.types'
import { QUERY_KEYS } from '../../../consts'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import Icon from '../../../sharedComponents/Icon'
import { MODAL_ID } from '../../../sharedComponents/Modal/Modal.consts'
import Photo from '../../../sharedComponents/Photo'
import { activeModalSignal, activeRecipeIdSignal } from '../../../signals'
import { FONT_SIZES, SPACING } from '../../../styles/consts'
import { formatCurrency, formatDisplayDate, getUnitLabel } from '../../../utilities'
import Recipe from './Recipe'

function RecipeRow({ row, labelId }: { row: RecipeDTO & { usedInRecipesCount: number }; labelId: string }) {
  useSignals()
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()

  const isOpen = computed(() => activeRecipeIdSignal.value === row.id)

  const opacity = computed(() => (activeRecipeIdSignal.value === '' ? 1 : isOpen.value ? 1 : 0.1))

  const handleDeleteRecipe = async () => {
    try {
      const response = await ipcMessenger.invoke(CHANNEL.DB.DELETE_RECIPE, {
        id: row.id,
      })

      if (response.success) {
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE] })
        // Close expanded recipe if it was the one being deleted
        if (activeRecipeIdSignal.value === row.id) {
          activeRecipeIdSignal.value = ''
        }
      }
    } catch (error) {
      log.error('Failed to delete recipe:', error)
    }
  }

  const openEditModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.EDIT_RECIPE_MODAL,
      recipe: row,
    }
  }

  const openConfirmationModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.CONFIRMATION_MODAL,
      title: t('confirmDeleteRecipe'),
      body: t('deleteRecipeConfirmation'),
      confirmationCallback: handleDeleteRecipe,
      showCancel: true,
    }
  }

  const openExportModal = () => {
    activeModalSignal.value = {
      id: MODAL_ID.EXPORT_RECIPES,
      recipes: [row],
    }
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
            onClick={(event) => {
              event.stopPropagation()
              activeRecipeIdSignal.value = isOpen.value ? '' : row.id
            }}
          >
            {isOpen.value ? (
              <Icon size={ICON_SIZE} name="collapseVertical" />
            ) : (
              <Icon size={ICON_SIZE} name="expandVertical" />
            )}
          </IconButton>
        </TableCell>
        <TableCell sx={cellSx} id={labelId} scope="row">
          {formatDisplayDate(row.createdAt)}
        </TableCell>
        <TableCell sx={cellSx} id={labelId} scope="row">
          <Stack direction="row" alignItems="center" spacing={SPACING.TINY.PX}>
            <span>{row.title}</span>
            {row.photoSrc ? <Photo type="backend" src={row.photoSrc} /> : null}
          </Stack>
        </TableCell>
        <TableCell align="right" id={labelId} scope="row" sx={cellSx}>
          {formatCurrency(row.cost)}
        </TableCell>
        <TableCell sx={cellSx} align="right">
          {row.produces} {getUnitLabel(row.units, 'plural')}
        </TableCell>
        <TableCell align="right" id={labelId} scope="row" sx={cellSx}>
          {formatCurrency(row.cost / row.produces)}
        </TableCell>
        <TableCell sx={cellSx} align="left">
          {t(row.status)}
        </TableCell>
        <TableCell sx={cellSx} align="left">
          <Typography variant="body2">{row.showInMenu ? t('yes') : t('no')}</Typography>
        </TableCell>
        {/* <TableCell sx={cellSx} align="left">
          {row.usedInRecipesCount}
        </TableCell> */}
        <TableCell sx={cellSx} align="right">
          <Tooltip title={t('editRecipe')}>
            <IconButton size="small" onClick={openEditModal}>
              <Icon size={ICON_SIZE} name="edit" />
            </IconButton>
          </Tooltip>
          <Tooltip title={`${t('export')} PDF`}>
            <IconButton size="small" onClick={openExportModal}>
              <Icon size={ICON_SIZE} name="download" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('deleteRecipe')}>
            <IconButton size="small" onClick={openConfirmationModal}>
              <Icon size={ICON_SIZE} name="delete" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={cellSx} style={{ padding: 0, border: 0 }} colSpan={9}>
          <Collapse in={isOpen.value} timeout="auto" unmountOnExit>
            <Recipe id={row.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

const ICON_SIZE = 16

const cellSx: SxProps = {
  fontSize: FONT_SIZES.SMALL.PX,
}

export default RecipeRow
