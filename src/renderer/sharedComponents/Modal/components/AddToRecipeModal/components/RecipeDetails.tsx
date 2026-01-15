import { Divider, Stack, Typography } from '@mui/material'
import type { AllUnits } from '../../../../../../shared/units.types'
import { useAppTranslation } from '../../../../../hooks/useTranslation'
import { SPACING } from '../../../../../styles/consts'
import { getUnitLabel } from '../../../../../utilities'
import { NumericInput } from '../../../../NumericInput'

const RecipeDetails = ({
  units,
  setQuantity,
  quantity,
}: {
  units: AllUnits
  quantity: number
  setQuantity: React.Dispatch<React.SetStateAction<number>>
}) => {
  const { t } = useAppTranslation()
  return (
    <Stack spacing={SPACING.MEDIUM.PX}>
      <Divider />
      <Stack spacing={SPACING.SMALL.PX} direction="row" sx={{ alignItems: 'center' }}>
        <NumericInput
          size="small"
          label={t('recipeUses')}
          placeholder={t('recipeUses')}
          fullWidth
          value={quantity}
          onValidChange={setQuantity}
          min={0}
        />
        <Typography>{getUnitLabel(units, quantity)}</Typography>
      </Stack>
    </Stack>
  )
}

export default RecipeDetails
