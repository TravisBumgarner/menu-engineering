import { Route, Routes } from 'react-router-dom'
import { ROUTES } from '../consts'
import BrowseIngredients from '../pages/BrowseIngredients/BrowseIngredients'
import BrowseRecipes from '../pages/BrowseRecipes/BrowseRecipes'
import Recipe from '../pages/Recipe'
import Settings from '../pages/Settings'
import UnitConversions from '../pages/UnitConversions'

export default function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.recipes.href()} element={<BrowseRecipes />} />
      <Route path={ROUTES.recipe.href()} element={<Recipe />} />
      <Route path={ROUTES.ingredients.href()} element={<BrowseIngredients />} />
      <Route path={ROUTES.settings.href()} element={<Settings />} />
      <Route path={ROUTES.unitConversions.href()} element={<UnitConversions />} />
    </Routes>
  )
}
