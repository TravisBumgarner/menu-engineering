import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS } from '../../consts'
import ipcMessenger from '../../ipcMessenger'
import Message from '../../sharedComponents/Message'
import { activeModalSignal } from '../../signals'
import Table from './components/Table'

const Recipe = () => {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div>No recipe ID provided.</div>
  }

  const { data, isLoading, error } = useQuery({
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
      recipeId: id,
      recipeTitle: data?.recipe?.title || '',
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading recipe.</div>
  }

  if (!data || !data.recipe) {
    return <div>Recipe not found.</div>
  }

  console.log

  return (
    <div>
      Recipe Page: {id} {data.recipe.produces}
      {data.ingredients.length ? (
        <Table ingredients={data.ingredients || []} />
      ) : (
        <Message
          message="No ingredients found."
          color="info"
          callback={handleAddIngredient}
          callbackText="Add Ingredient"
        />
      )}
    </div>
  )
}

export default Recipe
