import { useQuery } from '@tanstack/react-query'
import { CHANNEL } from '../../../shared/messages.types'
import { QUERY_KEYS } from '../../consts'
import ipcMessenger from '../../ipcMessenger'
import Message from '../../sharedComponents/Message'
import { activeModalSignal } from '../../signals'
import Table from './components/Table'

const BrowseRecipes = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.RECIPES],
    queryFn: () => ipcMessenger.invoke(CHANNEL.DB.GET_RECIPES),
  })

  const handleAddRecipe = () => {
    activeModalSignal.value = {
      id: 'ADD_RECIPE_MODAL',
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading recipes.</div>
  }

  if (!data) {
    return <div>No data available.</div>
  }

  return data.recipes.length ? (
    <Table recipes={data.recipes} />
  ) : (
    <Message
      includeVerticalMargin
      message="No recipes found."
      color="info"
      callback={handleAddRecipe}
      callbackText="Add Recipe"
    />
  )
}

export default BrowseRecipes
