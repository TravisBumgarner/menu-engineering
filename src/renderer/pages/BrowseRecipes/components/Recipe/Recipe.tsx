import { Box } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { CHANNEL } from '../../../../../shared/messages.types'
import { QUERY_KEYS } from '../../../../consts'
import { useAppTranslation } from '../../../../hooks/useTranslation'
import ipcMessenger from '../../../../ipcMessenger'
import { PALETTE, SPACING } from '../../../../styles/consts'
import Table from './components/Table'

const Recipe = ({ id }: { id: string }) => {
  const { t } = useAppTranslation()

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.RECIPE],
    queryFn: async () => {
      if (!id) throw new Error(t('recipeNotFound'))

      const response = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, {
        id,
      })
      console.log('fetching recipe with id', response.subRecipes)
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
        padding: SPACING.MEDIUM.PX,
        backgroundColor: PALETTE.grayscale[50],
      }}
    >
      <Table
        ingredients={data.ingredients}
        recipe={data.recipe}
        subRecipes={data.subRecipes}
      />
    </Box>
  )

  // return (
  //   <>
  //     {data.ingredients.length || data.subRecipes.length ? (

  //     ) : (
  //       <Message
  //         message={t('noIngredientsFound')}
  //         color="info"
  //         callback={handleAddIngredient}
  //         callbackText={t('addIngredient')}
  //       />
  //     )}
  //   </>
  // )
}

export default Recipe
