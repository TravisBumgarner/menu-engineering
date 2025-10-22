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
  const subRecipes = await queries.getRecipeSubRecipes(params.id)
  return {
    type: 'get_recipe',
    recipe: recipe || null,
    ingredients: ingredients || [],
    subRecipes: subRecipes || [],
  }
})

typedIpcMain.handle(CHANNEL.DB.ADD_SUB_RECIPE, async (_event, params) => {
  console.log('a)')
  const newRecipeId = await queries.addRecipe(params.payload.newRecipe)
  console.log('b)', newRecipeId)
  const newSubRecipeRecipeLink = await queries.addSubRecipeToRecipe({
    parentRecipeId: params.payload.parentRecipeId,
    childRecipeId: newRecipeId,
  })
  console.log('c)', newSubRecipeRecipeLink)
  return {
    type: 'add_sub_recipe_to_recipe',
    success: !!newRecipeId && !!newSubRecipeRecipeLink,
  }
})

typedIpcMain.handle(CHANNEL.DB.ADD_INGREDIENT, async (_event, params) => {
  const newIngredientId = await queries.addIngredient(
    params.payload.newIngredient,
  )

  // Ingredient can be added independently or directly to a recipe
  if (params.payload.recipeId && newIngredientId) {
    const newIngredientRecipeLink = await queries.addIngredientToRecipe({
      ingredientId: newIngredientId,
      recipeId: params.payload.recipeId,
    })
    return {
      type: 'add_ingredient',
      success: !!newIngredientId && !!newIngredientRecipeLink,
    }
  }

  return {
    type: 'add_ingredient',
    success: !!newIngredientId,
  }
})

typedIpcMain.handle(CHANNEL.DB.GET_INGREDIENTS, async () => {
  return {
    type: 'get_ingredients',
    ingredients: await queries.getIngredients(),
  }
})

typedIpcMain.handle(
  CHANNEL.DB.REMOVE_INGREDIENT_FROM_RECIPE,
  async (_event, params) => {
    const result = await queries.removeIngredientFromRecipe(
      params.ingredientId,
      params.recipeId,
    )
    return {
      type: 'remove_ingredient_from_recipe',
      success: !!result,
    }
  },
)

typedIpcMain.handle(CHANNEL.DB.UPDATE_INGREDIENT, async (_event, params) => {
  const result = await queries.updateIngredient(params.id, params.payload)
  return {
    type: 'update_ingredient',
    success: !!result,
  }
})

typedIpcMain.handle(CHANNEL.DB.UPDATE_RECIPE, async (_event, params) => {
  const result = await queries.updateRecipe(params.id, params.payload)
  return {
    type: 'update_recipe',
    success: !!result,
  }
})

typedIpcMain.handle(
  CHANNEL.DB.ADD_EXISTING_TO_RECIPE,
  async (_event, params) => {
    if (params.type === 'ingredient') {
      const result = await queries.addIngredientToRecipe({
        ingredientId: params.childId,
        recipeId: params.parentId,
      })
      return {
        type: 'add_existing_to_recipe',
        success: !!result,
      }
    }
    if (params.type === 'recipe') {
      const result = await queries.addSubRecipeToRecipe({
        parentRecipeId: params.parentId,
        childRecipeId: params.childId,
      })
      return {
        type: 'add_existing_to_recipe',
        success: !!result,
      }
    }
  },
)
