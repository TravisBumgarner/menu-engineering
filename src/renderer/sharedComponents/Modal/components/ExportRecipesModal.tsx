import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { pdf } from '@react-pdf/renderer'
import log from 'electron-log/renderer'
import { useMemo, useState } from 'react'
import { CHANNEL } from '../../../../shared/messages.types'
import type { RecipeDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'
import ipcMessenger from '../../../ipcMessenger'
import Icon from '../../../sharedComponents/Icon'
import { activeModalSignal } from '../../../signals'
import { SPACING } from '../../../styles/consts'
import { formateDateFilename } from '../../../utilities'
import type { MODAL_ID } from '../Modal.consts'
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set(recipes.map((recipe) => recipe.id)))
  const [includeImages, setIncludeImages] = useState(true)
  const [multiplePDFs, setMultiplePDFs] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Sort recipes alphabetically by title
  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => a.title.localeCompare(b.title))
  }, [recipes])

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return sortedRecipes
    const query = searchQuery.toLowerCase()
    return sortedRecipes.filter((recipe) => recipe.title.toLowerCase().includes(query))
  }, [sortedRecipes, searchQuery])

  // Disable multiple PDFs option if only one recipe is selected
  const canUseMultiplePDFs = selectedRecipes.size > 1

  const handleCancel = () => {
    activeModalSignal.value = null
  }

  const handleSelectAll = () => {
    setSelectedRecipes(new Set(recipes.map((recipe) => recipe.id)))
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
      const selectedRecipesList = recipes.filter((recipe) => selectedRecipes.has(recipe.id))

      const datePrefix = formateDateFilename()
      const pdfsToSave: Array<{ filename: string; data: Uint8Array }> = []

      const useMultiplePDFs = multiplePDFs && canUseMultiplePDFs

      if (useMultiplePDFs) {
        // Generate individual PDFs for each recipe
        for (const recipe of selectedRecipesList) {
          // Fetch detailed recipe data
          const result = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, {
            id: recipe.id,
          })

          let base64Data = ''
          if (includeImages && recipe.photoSrc) {
            const image = await ipcMessenger.invoke(CHANNEL.FILES.GET_PHOTO, {
              fileName: recipe.photoSrc,
            })

            if (image?.data) {
              const bytes = image.data as Uint8Array
              let binary = ''
              const chunkSize = 0x8000

              for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
              }

              base64Data = `data:${mimeFromExt(recipe.photoSrc)};base64,${btoa(binary)}`
            }
          }

          const recipeWithIngredients = {
            base64Data,
            ...recipe,
            ingredients: result.ingredients || [],
            subRecipes: result.subRecipes || [],
          }

          // Generate PDF for this recipe
          const blob = await pdf(
            <RecipesPDFDocument recipes={[recipeWithIngredients]} t={t} includeImages={includeImages} />,
          ).toBlob()

          // Convert blob to Uint8Array
          const arrayBuffer = await blob.arrayBuffer()
          const pdfData = new Uint8Array(arrayBuffer)

          // Clean recipe title for filename - format: recipeName_date
          const cleanTitle = recipe.title.replace(/[^a-zA-Z0-9\-_\s]/g, '').trim()
          pdfsToSave.push({
            filename: `${cleanTitle}_${datePrefix}`,
            data: pdfData,
          })
        }
      } else {
        // Generate single PDF with all recipes
        const recipesWithIngredients = await Promise.all(
          selectedRecipesList.map(async (recipe) => {
            const result = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, {
              id: recipe.id,
            })

            let base64Data = ''
            if (includeImages && recipe.photoSrc) {
              const image = await ipcMessenger.invoke(CHANNEL.FILES.GET_PHOTO, {
                fileName: recipe.photoSrc,
              })

              if (image?.data) {
                const bytes = image.data as Uint8Array
                let binary = ''
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

        // Generate single PDF
        const blob = await pdf(
          <RecipesPDFDocument recipes={recipesWithIngredients} t={t} includeImages={includeImages} />,
        ).toBlob()

        // Convert blob to Uint8Array
        const arrayBuffer = await blob.arrayBuffer()
        const pdfData = new Uint8Array(arrayBuffer)

        // Format: recipeName_date (or "recipes_date" if multiple selected)
        const filename =
          selectedRecipesList.length === 1
            ? `${selectedRecipesList[0].title.replace(/[^a-zA-Z0-9\-_\s]/g, '').trim()}_${datePrefix}`
            : `${t('recipes')}_${datePrefix}`

        pdfsToSave.push({
          filename,
          data: pdfData,
        })
      }

      // Send all PDFs to main process for saving
      const result = await ipcMessenger.invoke(CHANNEL.FILES.EXPORT_RECIPES_PDF, {
        pdfs: pdfsToSave,
        oneFilePerRecipe: useMultiplePDFs,
      })

      if (!result.success) {
        log.error('Error saving PDFs:', result.error)
        return
      }

      activeModalSignal.value = null
    } catch (error) {
      log.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DefaultModal
      sx={{ height: '80vh' }}
      title={`${t('export')}: ${t('recipes')} PDF`}
    >
      <Stack spacing={SPACING.SMALL.PX} height="100%" sx={{ minHeight: 0 }}>
        <Stack direction="row" spacing={SPACING.MEDIUM.PX} alignItems="center" justifyContent="space-between" sx={{ flexShrink: 0 }}>
          <Typography variant="body2" color="textSecondary">
            {t('export')}: {selectedRecipes.size} {selectedRecipes.size === 1 ? t('recipe') : t('recipes')} of{' '}
            {recipes.length}
          </Typography>
          <Stack direction="row" spacing={SPACING.SMALL.PX} marginLeft="auto">
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

        <TextField
          size="small"
          placeholder={t('searchRecipes')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ flexShrink: 0 }}
          slotProps={{
            input: {
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')} edge="end">
                    <Icon name="close" size={18} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            padding: SPACING.XXXS.PX,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Stack spacing={SPACING.TINY.PX}>
            {filteredRecipes.map((recipe) => (
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

        <Stack direction="row" spacing={3} alignItems="center" sx={{ flexShrink: 0 }}>
          <FormControlLabel
            control={
              <Checkbox checked={includeImages} onChange={(e) => setIncludeImages(e.target.checked)} size="small" />
            }
            label={t('includeImages')}
          />
          <ToggleButtonGroup
            value={multiplePDFs ? 'multiple' : 'single'}
            exclusive
            onChange={(_, value) => {
              if (value !== null) {
                setMultiplePDFs(value === 'multiple')
              }
            }}
            size="small"
            color="primary"
          >
            <ToggleButton value="single" sx={{ fontWeight: multiplePDFs ? 'normal' : 'bold' }}>
              {t('singlePDF')}
            </ToggleButton>
            <ToggleButton
              value="multiple"
              disabled={!canUseMultiplePDFs}
              sx={{ fontWeight: multiplePDFs ? 'bold' : 'normal' }}
            >
              {t('multiplePDFs')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ flexShrink: 0 }}>
          <Button variant="outlined" onClick={handleCancel} disabled={isGenerating}>
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={handleExport} disabled={isGenerating || selectedRecipes.size === 0}>
            {isGenerating ? `${t('loading')}` : `${t('export')} PDF`}
          </Button>
        </Stack>
      </Stack>
    </DefaultModal>
  )
}

export default ExportRecipes
