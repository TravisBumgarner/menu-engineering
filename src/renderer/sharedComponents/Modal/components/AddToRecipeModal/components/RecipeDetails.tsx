import { Divider, Stack, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { AllUnits } from "../../../../../../shared/units.types"
import { useAppTranslation } from "../../../../../hooks/useTranslation"
import { SPACING } from "../../../../../styles/consts"
import { getUnitLabel } from "../../../../../utilities"

const RecipeDetails = ({ units }: { units: AllUnits }) => {
    const [quantity, setQuantity] = useState<number>(0)
    const { t } = useAppTranslation()
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setQuantity(Number(value))
    }

    return (<Stack spacing={SPACING.MEDIUM.PX}>
        <Divider />
        <Stack
            spacing={SPACING.SMALL.PX}
            direction="row"
            sx={{ alignItems: 'center' }}
        >
            <TextField
                fullWidth
                size="small"
                label={t('recipeUses')}
                value={quantity}
                onChange={handleInputChange}
                required
                placeholder={t('recipeUses')}
            />
            <Typography>{getUnitLabel(
                units,
                quantity,
            )}</Typography>
        </Stack>
    </Stack>)
}

export default RecipeDetails