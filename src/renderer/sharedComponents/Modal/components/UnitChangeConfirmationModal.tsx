import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { AllUnits } from '../../../../shared/units.types'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { formatCurrency, getUnitLabel } from '../../../utilities'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface UnitChangeConfirmationModalProps {
  id: typeof MODAL_ID.UNIT_CHANGE_CONFIRMATION_MODAL
  /** Type of item being changed */
  itemType: 'ingredient' | 'recipe'
  /** Name of the item being changed */
  itemName: string
  /** Original unit */
  fromUnit: AllUnits
  /** New unit */
  toUnit: AllUnits
  /** Whether the units are compatible (same category) */
  isCompatible: boolean
  /** For compatible ingredient changes: the converted unit cost */
  convertedUnitCost?: number
  /** For compatible ingredient changes: the original unit cost */
  originalUnitCost?: number
  /** For incompatible changes: list of affected items (recipes or parent recipes) */
  affectedItems?: Array<{ id: string; title: string }>
  /** Callback when user confirms the change */
  onConfirm: () => void
  /** Callback when user cancels */
  onCancel: () => void
}

const UnitChangeConfirmationModal = ({
  itemType,
  itemName,
  fromUnit,
  toUnit,
  isCompatible,
  convertedUnitCost,
  originalUnitCost,
  affectedItems,
  onConfirm,
  onCancel,
}: UnitChangeConfirmationModalProps) => {
  const { t } = useTranslation()

  const handleCancel = useCallback(() => {
    onCancel()
    activeModalSignal.value = null
  }, [onCancel])

  const handleConfirm = useCallback(() => {
    onConfirm()
    activeModalSignal.value = null
  }, [onConfirm])

  const fromUnitLabel = getUnitLabel(fromUnit, 'plural')
  const toUnitLabel = getUnitLabel(toUnit, 'plural')

  const title = isCompatible ? t('unitChangeConfirmTitle') : t('unitChangeWarningTitle')

  return (
    <DefaultModal title={title}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING.MEDIUM.PX }}>
        {/* Item info */}
        <Typography variant="body1">
          {t('unitChangeItemInfo', { itemName, fromUnit: fromUnitLabel, toUnit: toUnitLabel })}
        </Typography>

        {/* Compatible change - show conversion preview */}
        {isCompatible &&
          itemType === 'ingredient' &&
          convertedUnitCost !== undefined &&
          originalUnitCost !== undefined && (
            <Box
              sx={{
                backgroundColor: 'action.hover',
                padding: SPACING.SMALL.PX,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t('unitCostConversionPreview')}
              </Typography>
              <Typography variant="body1">
                {formatCurrency(originalUnitCost)} / {fromUnitLabel} → {formatCurrency(convertedUnitCost)} /{' '}
                {toUnitLabel}
              </Typography>
            </Box>
          )}

        {/* Compatible recipe change - simple confirmation */}
        {isCompatible && itemType === 'recipe' && (
          <Typography variant="body2" color="text.secondary">
            {t('unitChangeRecipeCompatibleInfo')}
          </Typography>
        )}

        {/* Incompatible change - show warning and affected items */}
        {!isCompatible && (
          <>
            <Box
              sx={{
                backgroundColor: 'warning.light',
                padding: SPACING.SMALL.PX,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" fontWeight="bold" color="warning.dark">
                {t('unitChangeWarning')}
              </Typography>
              <Typography variant="body2" color="warning.dark">
                {itemType === 'ingredient'
                  ? t('unitChangeIncompatibleIngredientInfo')
                  : t('unitChangeIncompatibleRecipeInfo')}
              </Typography>
            </Box>

            {affectedItems && affectedItems.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {t('unitChangeAffectedItems', { count: affectedItems.length })}
                </Typography>
                <Box component="ul" sx={{ margin: 0, paddingLeft: SPACING.MEDIUM.PX }}>
                  {affectedItems.slice(0, 5).map((item) => (
                    <Typography component="li" variant="body2" key={item.id}>
                      {item.title}
                    </Typography>
                  ))}
                  {affectedItems.length > 5 && (
                    <Typography component="li" variant="body2" color="text.secondary">
                      {t('unitChangeAndMore', { count: affectedItems.length - 5 })}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </>
        )}

        {/* Action buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: SPACING.SMALL.PX,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: SPACING.SMALL.PX,
          }}
        >
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button variant="contained" color={isCompatible ? 'primary' : 'warning'} onClick={handleConfirm}>
            {t('unitChangeConfirmButton')}
          </Button>
        </Box>
      </Box>
    </DefaultModal>
  )
}

export default UnitChangeConfirmationModal
