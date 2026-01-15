import { Route, Routes } from 'react-router-dom'
import { ROUTES } from '../consts'
import BrowseIngredients from '../pages/BrowseIngredients/BrowseIngredients'
import BrowseRecipes from '../pages/BrowseRecipes/BrowseRecipes'

export default function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.recipes.href()} element={<BrowseRecipes />} />
      <Route path={ROUTES.ingredients.href()} element={<BrowseIngredients />} />
    </Routes>
  )
}
