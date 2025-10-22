import { Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS } from '../../consts'
import { useAppTranslation } from '../../hooks/useTranslation'
import ipcMessenger from '../../ipcMessenger'
import Message from '../../sharedComponents/Message'
import { activeModalSignal } from '../../signals'
import Table from './components/Table'

const Recipe = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useAppTranslation()

  if (!id) {
    return <div>{t('recipeNotFound')}</div>
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.RECIPE, id],
    queryFn: async () => {
      const response = await ipcMessenger.invoke(CHANNEL.DB.GET_RECIPE, {
        id,
      })
      return response
    },
  })

  const handleAddIngredient = () => {
    activeModalSignal.value = {
      id: 'ADD_INGREDIENT_MODAL',
      recipe: data?.recipe || undefined,
    }
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
    <div>
      <Typography variant="h1">{data.recipe.title}</Typography>
      {data.ingredients.length || data.subRecipes.length ? (
        <Table
          ingredients={data.ingredients}
          recipe={data.recipe}
          subRecipes={data.subRecipes}
        />
      ) : (
        <Message
          includeVerticalMargin
          message={t('noIngredientsFound')}
          color="info"
          callback={handleAddIngredient}
          callbackText={t('addIngredient')}
        />
      )}
    </div>
  )
}

export default Recipe
