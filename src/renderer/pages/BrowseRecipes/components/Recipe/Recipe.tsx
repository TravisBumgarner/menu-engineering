import { useQuery } from '@tanstack/react-query'
import { CHANNEL } from '../../../../../shared/messages.types'
import { QUERY_KEYS } from '../../../../consts'
import { useAppTranslation } from '../../../../hooks/useTranslation'
import ipcMessenger from '../../../../ipcMessenger'
import Message from '../../../../sharedComponents/Message'
import { activeModalSignal } from '../../../../signals'
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
    <>
      {data.ingredients.length || data.subRecipes.length ? (
        <Table
          ingredients={data.ingredients}
          recipe={data.recipe}
          subRecipes={data.subRecipes}
        />
      ) : (
        <Message
          message={t('noIngredientsFound')}
          color="info"
          callback={handleAddIngredient}
          callbackText={t('addIngredient')}
        />
      )}
    </>
  )
}

export default Recipe
