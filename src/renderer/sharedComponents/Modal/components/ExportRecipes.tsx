import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { pdf } from '@react-pdf/renderer'
import { useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import { RecipeDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { formateDateFilename } from '../../../utilities'
import { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'
import RecipesPDFDocument from './RecipesPDFDocument'

export interface ExportRecipesProps {
  id: typeof MODAL_ID.EXPORT_RECIPES
  recipes: (RecipeDTO & { usedInRecipesCount: number })[]
}

const ExportRecipes = ({ recipes }: ExportRecipesProps) => {
  const { t } = useAppTranslation()
  const [filename, setFilename] = useState(
    `${formateDateFilename()}_${t('recipes')}`,
  )
  const [isGenerating, setIsGenerating] = useState(false)

  const handleCancel = () => {
    activeModalSignal.value = null
  }

  const handleExport = async () => {
    setIsGenerating(true)
    try {
      // Fetch detailed recipe data with ingredients
      const recipesWithIngredients = await Promise.all(
        recipes.map(async recipe => {
          const result = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, {
            id: recipe.id,
          })
          return {
            ...recipe,
            ingredients: result.ingredients || [],
            subRecipes: result.subRecipes || [],
          }
        }),
      )

      // Generate PDF
      const blob = await pdf(
        <RecipesPDFDocument recipes={recipesWithIngredients} t={t} />,
      ).toBlob()

      // Create and trigger download
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.pdf`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      activeModalSignal.value = null
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DefaultModal title={`${t('export')}: ${t('recipes')} PDF`}>
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
            {t('export')}: {recipes.length}{' '}
            {recipes.length === 1 ? t('recipe') : t('recipes')}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isGenerating}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={!filename.trim() || isGenerating}
            >
              {isGenerating ? `${t('loading')}...` : `${t('export')} PDF`}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DefaultModal>
  )
}

export default ExportRecipes
