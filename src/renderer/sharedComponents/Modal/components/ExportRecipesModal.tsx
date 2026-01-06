import { Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material'
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

const mimeFromExt = (name: string) => {
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

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
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(
    new Set(recipes.map(recipe => recipe.id))
  )
  const [includeImages, setIncludeImages] = useState(true)
  const [oneFilePerRecipe, setOneFilePerRecipe] = useState(false)

  const handleCancel = () => {
    activeModalSignal.value = null
  }

  const handleSelectAll = () => {
    setSelectedRecipes(new Set(recipes.map(recipe => recipe.id)))
  }

  const handleSelectNone = () => {
    setSelectedRecipes(new Set())
  }

  const handleRecipeToggle = (recipeId: string) => {
    const newSelected = new Set(selectedRecipes)
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId)
    } else {
      newSelected.add(recipeId)
    }
    setSelectedRecipes(newSelected)
  }

  const handleExport = async () => {
    setIsGenerating(true)
    try {
      // Filter selected recipes
      const selectedRecipesList = recipes.filter(recipe =>
        selectedRecipes.has(recipe.id)
      )

      // Generate single PDF with all recipes (existing behavior)
      // Fetch detailed recipe data with ingredients
      const recipesWithIngredients = await Promise.all(
        selectedRecipesList.map(async recipe => {
          const result = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, {
            id: recipe.id,
          })

          let base64Data = ""
          if (includeImages && recipe.photoSrc) {


            const image = await ipcMessenger.invoke(CHANNEL.FILES.GET_PHOTO, {
              fileName: recipe.photoSrc,
            })

            if (image?.data) {
              const bytes = image.data as Uint8Array
              let binary = ""
              const chunkSize = 0x8000

              for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
              }

              base64Data = `data:${mimeFromExt(recipe.photoSrc)};base64,${btoa(binary)}`
            }
          }
          return {
            base64Data,
            ...recipe,
            ingredients: result.ingredients || [],
            subRecipes: result.subRecipes || [],
          }
        }),
      )

      // Generate PDF
      const blob = await pdf(
        <RecipesPDFDocument
          recipes={recipesWithIngredients}
          t={t}
          includeImages={includeImages}
        />,
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

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack>
              <Typography variant="body2" color="textSecondary">
                {t('export')}: {selectedRecipes.size}{' '}
                {selectedRecipes.size === 1 ? t('recipe') : t('recipes')} of {recipes.length}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} marginLeft="auto">
              <Typography variant="body2" color="textSecondary" alignSelf="center">
                {t('select')}:
              </Typography>
              <Button size="small" variant="outlined" onClick={handleSelectAll}>
                {t('all')}
              </Button>
              <Button size="small" variant="outlined" onClick={handleSelectNone}>
                {t('none')}
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ maxHeight: 300, overflow: 'auto', padding: SPACING.TINY.PX, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Stack spacing={SPACING.SMALL.PX}>
              {recipes.map(recipe => (
                <FormControlLabel
                  key={recipe.id}
                  control={
                    <Checkbox
                      checked={selectedRecipes.has(recipe.id)}
                      onChange={() => handleRecipeToggle(recipe.id)}
                      size="small"
                    />
                  }
                  label={recipe.title}
                />
              ))}
            </Stack>
          </Box>

          <Stack direction="row" spacing={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeImages}
                  onChange={e => setIncludeImages(e.target.checked)}
                  size="small"
                />
              }
              label={t('includeImages')}
            />
            {/* <FormControlLabel
              control={
                <Checkbox
                  checked={oneFilePerRecipe}
                  onChange={e => setOneFilePerRecipe(e.target.checked)}
                  size="small"
                />
              }
              label={t('oneFilePerRecipe')}
            /> */}
          </Stack>

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
              disabled={!filename.trim() || isGenerating || selectedRecipes.size === 0}
            >
              {isGenerating ? `${t('loading')}...` : `${t('export')} PDF`}
            </Button>
          </Stack>
        </Stack >
      </Box >
    </DefaultModal >
  )
}

export default ExportRecipes
