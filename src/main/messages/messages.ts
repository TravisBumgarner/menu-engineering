import path from 'node:path'
import { CHANNEL } from '../../shared/messages.types'
import queries from '../database/queries'
import { typedIpcMain } from './index'

typedIpcMain.handle(CHANNEL.DB.ADD_RECIPE, async (_event, params) => {
  const recipeId = await queries.addRecipe(params.payload)
  return {
    type: 'add_recipe',
    recipeId,
  }
})

typedIpcMain.handle(CHANNEL.DB.GET_RECIPES, async () => {
  return {
    type: 'get_recipes',
    recipes: await queries.getRecipes(),
  }
})

typedIpcMain.handle(CHANNEL.DB.GET_RECIPE_COST, async (_event, params) => {
  const result = await queries.getRecipeCost(params.id)
  return {
    type: 'get_recipe_cost',
    ...result,
  }
})

typedIpcMain.handle(CHANNEL.DB.GET_RECIPE, async (_event, params) => {
  const recipe = await queries.getRecipe(params.id)
  const ingredients = await queries.getRecipeIngredients(params.id)
  const subRecipes = await queries.getRecipeSubRecipes(params.id)
  const usedInRecipes = await queries.getRecipesUsingSubRecipe(params.id)
  return {
    type: 'get_recipe',
    recipe: recipe || null,
    ingredients: ingredients || [],
    subRecipes: subRecipes || [],
    usedInRecipes: usedInRecipes || [],
  }
})

typedIpcMain.handle(CHANNEL.DB.ADD_SUB_RECIPE, async (_event, params) => {
  const newRecipeId = await queries.addRecipe(params.payload.newRecipe)
  const newSubRecipeRecipeLink = await queries.addSubRecipeToRecipe({
    parentId: params.payload.parentRecipeId,
    childId: newRecipeId,
    units: params.payload.units,
  })
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
      childId: newIngredientId,
      parentId: params.payload.recipeId,
      units: params.payload.units,
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

typedIpcMain.handle(CHANNEL.DB.GET_INGREDIENT, async (_event, params) => {
  const ingredient = await queries.getIngredient(params.id)
  const usedInRecipes = await queries.getRecipesUsingIngredient(params.id)
  return {
    type: 'get_ingredient',
    ingredient: ingredient || null,
    usedInRecipes: usedInRecipes || [],
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

typedIpcMain.handle(
  CHANNEL.DB.REMOVE_SUB_RECIPE_FROM_RECIPE,
  async (_event, params) => {
    const result = await queries.removeSubRecipeFromRecipe(
      params.subRecipeId,
      params.recipeId,
    )
    return {
      type: 'remove_sub_recipe_from_recipe',
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
      const result = await queries.addIngredientToRecipe(params)
      return {
        type: 'add_existing_to_recipe',
        success: !!result,
      }
    }
    if (params.type === 'sub-recipe') {
      const result = await queries.addSubRecipeToRecipe(params)
      return {
        type: 'add_existing_to_recipe',
        success: !!result,
      }
    }
  },
)

typedIpcMain.handle(
  CHANNEL.DB.UPDATE_RECIPE_RELATION,
  async (_event, params) => {
    const result = await queries.updateRecipeRelation(
      params.parentId,
      params.childId,
      params.type,
      params.quantity,
      params.units,
    )
    return {
      type: 'update_recipe_relation',
      success: !!result,
    }
  },
)

typedIpcMain.handle(CHANNEL.APP.GET_BACKUP_DIRECTORY, async () => {
  return {
    type: 'get_backup_directory',
    backupDirectory: path.resolve(process.cwd(), 'db_backups'),
  }
})
