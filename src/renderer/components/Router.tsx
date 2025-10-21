import { Route, Routes } from 'react-router-dom'
import BrowseRecipes from '../pages/BrowseRecipes/BrowseRecipes'
import Recipe from '../pages/Recipe'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<BrowseRecipes />} />
      <Route path="/recipe/:id" element={<Recipe />} />
    </Routes>
  )
}
