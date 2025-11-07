import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { IngredientDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { formateDateFilename } from '../../../utilities'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

export interface ExportCsvModalProps {
  id: typeof MODAL_ID.EXPORT_CSV_MODAL
  ingredients: (IngredientDTO & { recipeCount: number })[]
}

const ExportCsvModal = ({ ingredients }: ExportCsvModalProps) => {
  const { t } = useAppTranslation()
  const [filename, setFilename] = useState(
    formateDateFilename() + `_${t('ingredients')}`,
  )

  const handleCancel = () => {
    activeModalSignal.value = null
  }

  const handleExport = () => {
    // Create CSV content
    const headers = [
      t('created'),
      t('title'),
      t('units'),
      t('unitCost'),
      t('usedIn'),
    ]
    const csvContent = [
      headers.join(','),
      ...ingredients.map(ingredient =>
        [
          `"${new Date(ingredient.createdAt).toLocaleDateString()}"`,
          `"${ingredient.title}"`,
          ingredient.units,
          ingredient.unitCost,
          ingredient.recipeCount || 0,
        ].join(','),
      ),
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    activeModalSignal.value = null
  }

  return (
    <DefaultModal title={`${t('export')}: ${t('ingredients')} CSV`}>
      <Box>
        <Stack spacing={SPACING.MEDIUM.PX}>
          <TextField
            size="small"
            label="Filename"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            fullWidth
          />

          <Typography variant="body2" color="textSecondary">
            {t('export')}: {ingredients.length}{' '}
            {ingredients.length === 1 ? t('ingredient') : t('ingredients')}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleCancel}>
              {t('cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={!filename.trim()}
            >
              {t('export')} CSV
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default ExportCsvModal
