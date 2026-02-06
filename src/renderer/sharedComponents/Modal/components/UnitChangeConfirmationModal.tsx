import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { AllUnits } from '../../../../shared/units.types'
import { activeModalSignal } from '../../../signals'
import { FORMATTING, SPACING } from '../../../styles/consts'
import { getUnitLabel } from '../../../utilities'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface AffectedItem {
  id: string
  title: string
  /** Current quantity in the relation */
  quantity?: number
  /** Converted quantity (for compatible changes) */
  convertedQuantity?: number
}

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
  /** List of affected items (recipes or parent recipes) with optional quantity info */
  affectedItems?: AffectedItem[]
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
  const fromUnitAbbrev = getUnitLabel(fromUnit, 'singular')
  const toUnitAbbrev = getUnitLabel(toUnit, 'singular')

  const title = isCompatible ? t('unitChangeConfirmTitle') : t('unitChangeWarningTitle')

  const formatQuantity = (qty: number) => qty.toFixed(FORMATTING.COST_DECIMAL_PLACES)

  return (
    <DefaultModal title={title}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING.SM.PX }}>
        {/* Item info */}
        <Typography variant="body1">
          {t('unitChangeItemInfo', { itemName, fromUnit: fromUnitLabel, toUnit: toUnitLabel })}
        </Typography>


        {/* Compatible change - show quantity conversions for affected items */}
        {isCompatible && affectedItems && affectedItems.length > 0 && (
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {t('unitChangeAffectedItems', { count: affectedItems.length })}
            </Typography>
            <Box component="ul" sx={{ margin: 0, paddingLeft: SPACING.SM.PX }}>
              {affectedItems.slice(0, 5).map((item) => (
                <Typography component="li" variant="body2" key={item.id}>
                  {item.title}
                  {item.quantity !== undefined && item.convertedQuantity !== undefined && (
                    <>
                      : {formatQuantity(item.quantity)} {fromUnitAbbrev} → {formatQuantity(item.convertedQuantity)}{' '}
                      {toUnitAbbrev}
                    </>
                  )}
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

        {/* Incompatible change - show warning and affected items */}
        {!isCompatible && (
          <>
            <Box
              sx={{
                backgroundColor: 'error.light',
                padding: SPACING.XS.PX,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" fontWeight="bold" color="error.contrastText">
                {t('unitChangeWarning')}
              </Typography>
              <Typography variant="body2" color="error.contrastText">
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
                <Box component="ul" sx={{ margin: 0, paddingLeft: SPACING.SM.PX }}>
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
            gap: SPACING.XXS.PX,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: SPACING.XS.PX,
          }}
        >
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button variant="contained" color={isCompatible ? 'primary' : 'error'} onClick={handleConfirm}>
            {t('unitChangeConfirmButton')}
          </Button>
        </Box>
      </Box>
    </DefaultModal>
  )
}

export default UnitChangeConfirmationModal
