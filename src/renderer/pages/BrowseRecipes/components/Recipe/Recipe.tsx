import { Box, Button, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { CHANNEL } from '../../../../../shared/messages.types'
import { QUERY_KEYS } from '../../../../consts'
import { useAppTranslation } from '../../../../hooks/useTranslation'
import ipcMessenger from '../../../../ipcMessenger'
import { activeRecipeIdSignal } from '../../../../signals'
import { SPACING } from '../../../../styles/consts'
import Table from './components/Table'

const Recipe = ({ id }: { id: string }) => {
  const { t } = useAppTranslation()

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.RECIPE, id],
    queryFn: async () => {
      if (!id) throw new Error(t('recipeNotFound'))

      const response = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, {
        id,
      })
      return response
    },
  })

  if (!id) {
    return <div>{t('recipeNotFound')}</div>
  }

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (isError) {
    return <div>{t('errorLoadingRecipe')}</div>
  }

  if (!data || !data.recipe) {
    return <div>{t('recipeNotFound')}</div>
  }

  return (
    <Box
      sx={{
        padding: SPACING.SMALL.PX,
      }}
    >
      <Typography>
        {t('usedIn')}: {data.usedInRecipes.length === 0 && ` 0 ${t('recipes')}`}
        {data.usedInRecipes.map((recipe) => {
          const setActiveRecipe = () => {
            activeRecipeIdSignal.value = recipe.id
          }
          return (
            <Button variant="text" key={recipe.id} onClick={setActiveRecipe}>
              {recipe.title}
            </Button>
          )
        })}
      </Typography>
      <Table ingredients={data.ingredients} recipe={data.recipe} subRecipes={data.subRecipes} />
    </Box>
  )
}

export default Recipe
