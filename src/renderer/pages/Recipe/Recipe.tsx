import { useParams } from 'react-router-dom'

const Recipe = () => {
  const { id } = useParams<{ id: string }>()

  return <div>Recipe Page: {id}</div>
}

export default Recipe
