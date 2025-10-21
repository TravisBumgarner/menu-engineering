import { CHANNEL } from '../../shared/messages.types'
import queries from '../database/queries'
import { typedIpcMain } from './index'

typedIpcMain.handle(CHANNEL.DB.ADD_RECIPE, async (_event, params) => {
  const result = await queries.addRecipe(params.payload)
  return {
    type: 'add_recipe',
    success: !!result,
  }
})

typedIpcMain.handle(CHANNEL.DB.GET_RECIPES, async () => {
  return {
    type: 'get_recipes',
    recipes: await queries.getRecipes(),
  }
})

typedIpcMain.handle(CHANNEL.DB.GET_RECIPE, async (_event, params) => {
  const recipe = await queries.getRecipe(params.id)
  const ingredients = await queries.getRecipeIngredients(params.id)
  return {
    type: 'get_recipe',
    recipe: recipe || null,
    ingredients: ingredients || [],
  }
})

typedIpcMain.handle(CHANNEL.DB.ADD_INGREDIENT, async (_event, params) => {
  const newIngredientId = await queries.addIngredient(params.payload)
  let newLink: string | undefined
  console.log('params.payload.recipeId', params.payload.recipeId)

  if (params.payload.recipeId && newIngredientId) {
    console.log('inserting ingredeint to recipe')
    newLink = await queries.addIngredientToRecipe({
      ingredientId: newIngredientId,
      recipeId: params.payload.recipeId,
    })
  }
  return {
    type: 'add_ingredient',
    success: !!newIngredientId && (params.payload.recipeId ? !!newLink : true),
  }
})

typedIpcMain.handle(CHANNEL.DB.GET_INGREDIENTS, async () => {
  return {
    type: 'get_ingredients',
    ingredients: await queries.getIngredients(),
  }
})
