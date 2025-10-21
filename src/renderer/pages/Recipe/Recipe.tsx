import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS } from '../../consts'
import ipcMessenger from '../../ipcMessenger'

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

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading recipe.</div>
  }

  console.log('Recipe data:', data)

  return (
    <div>
      Recipe Page: {id} {data?.recipe?.produces}
      {data?.ingredients.map(ingredient => (
        <div key={ingredient.id}>
          {ingredient.name} - {ingredient.quantity} {ingredient.unit}
        </div>
      ))}
    </div>
  )
}

export default Recipe
