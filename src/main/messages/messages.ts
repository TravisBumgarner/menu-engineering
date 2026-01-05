import path from 'node:path'
import { CHANNEL } from '../../shared/messages.types'
import { RelationDTO } from '../../shared/recipe.types'
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

import { app } from 'electron'

typedIpcMain.handle(CHANNEL.APP.GET_BACKUP_DIRECTORY, async () => {
  const isProd = app.isPackaged
  const baseDir = isProd ? app.getPath('userData') : process.cwd()
  return {
    type: 'get_backup_directory',
    backupDirectory: path.resolve(baseDir, 'db_backups'),
  }
})

typedIpcMain.handle(CHANNEL.APP.EXPORT_ALL_DATA, async () => {
  try {
    // Get all data from the database
    const ingredients = await queries.getIngredients()
    const recipes = await queries.getRecipes()

    // Get all relations by fetching detailed data for each recipe
    const relations: Array<
      RelationDTO & {
        parentId: string
        childId: string
        type: 'ingredient' | 'sub-recipe'
      }
    > = []

    for (const recipe of recipes) {
      const recipeIngredients = await queries.getRecipeIngredients(recipe.id)
      const recipeSubRecipes = await queries.getRecipeSubRecipes(recipe.id)

      // Add ingredient relations
      for (const ing of recipeIngredients || []) {
        relations.push({
          parentId: recipe.id,
          childId: ing.id,
          type: 'ingredient' as const,
          quantity: ing.relation.quantity,
          units: ing.relation.units,
        })
      }

      // Add sub-recipe relations
      for (const subRecipe of recipeSubRecipes || []) {
        relations.push({
          parentId: recipe.id,
          childId: subRecipe.id,
          type: 'sub-recipe' as const,
          quantity: subRecipe.relation.quantity,
          units: subRecipe.relation.units,
        })
      }
    }

    return {
      type: 'export_all_data',
      success: true,
      data: {
        ingredients: ingredients || [],
        recipes: recipes || [],
        relations,
      },
    }
  } catch (error) {
    return {
      type: 'export_all_data',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})

typedIpcMain.handle(CHANNEL.APP.RESTORE_ALL_DATA, async (_event, params) => {
  try {
    // This is a destructive operation - wipe all existing data first
    const { db } = await import('../database/client.js')
    const {
      recipeSchema,
      ingredientSchema,
      recipeIngredientSchema,
      recipeSubRecipeSchema,
    } = await import('../database/schema.js')

    // Delete all records from all tables (same as nuke database)
    // Order matters due to foreign key relationships: delete relations first, then main entities
    await db.delete(recipeIngredientSchema).run()
    await db.delete(recipeSubRecipeSchema).run()
    await db.delete(recipeSchema).run()
    await db.delete(ingredientSchema).run()

    // Insert new data
    const { ingredients, recipes, relations } = params.data

    // Keep track of old ID -> new ID mappings
    const ingredientIdMap = new Map<string, string>()
    const recipeIdMap = new Map<string, string>()

    // Insert ingredients first and track ID mappings
    for (const ingredient of ingredients) {
      const newIngredientId = await queries.addIngredient({
        title: ingredient.title,
        unitCost: ingredient.unitCost,
        units: ingredient.units,
      })
      ingredientIdMap.set(ingredient.id, newIngredientId)
    }

    // Insert recipes and track ID mappings
    for (const recipe of recipes) {
      const newRecipeId = await queries.addRecipe({
        title: recipe.title,
        produces: recipe.produces,
        units: recipe.units,
        status: recipe.status,
        showInMenu: recipe.showInMenu,
      })
      recipeIdMap.set(recipe.id, newRecipeId)
    }

    // Insert relations using the new IDs
    for (const relation of relations) {
      const newParentId = recipeIdMap.get(relation.parentId)
      if (!newParentId) {
        console.warn(
          `Could not find new parent ID for relation: ${relation.parentId}`,
        )
        continue
      }

      if (relation.type === 'ingredient') {
        const newChildId = ingredientIdMap.get(relation.childId)
        if (!newChildId) {
          console.warn(
            `Could not find new ingredient ID for relation: ${relation.childId}`,
          )
          continue
        }
        await queries.addIngredientToRecipe({
          parentId: newParentId,
          childId: newChildId,
          units: relation.units,
        })
        // Set the quantity using the existing update mechanism
        console.log(
          `Setting ingredient quantity: ${relation.quantity} for ${newChildId}`,
        )
        await queries.updateRecipeRelation(
          newParentId,
          newChildId,
          'ingredient',
          relation.quantity,
          relation.units,
        )
      } else if (relation.type === 'sub-recipe') {
        const newChildId = recipeIdMap.get(relation.childId)
        if (!newChildId) {
          console.warn(
            `Could not find new recipe ID for relation: ${relation.childId}`,
          )
          continue
        }
        await queries.addSubRecipeToRecipe({
          parentId: newParentId,
          childId: newChildId,
          units: relation.units,
        })
        // Set the quantity using the existing update mechanism
        await queries.updateRecipeRelation(
          newParentId,
          newChildId,
          'sub-recipe',
          relation.quantity,
          relation.units,
        )
      }
    }

    return {
      type: 'restore_all_data',
      success: true,
    }
  } catch (error) {
    return {
      type: 'restore_all_data',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})

typedIpcMain.handle(CHANNEL.APP.NUKE_DATABASE, async () => {
  try {
    // This is a destructive operation that clears all data from all tables
    const { db } = await import('../database/client.js')
    const {
      recipeSchema,
      ingredientSchema,
      recipeIngredientSchema,
      recipeSubRecipeSchema,
    } = await import('../database/schema.js')

    // Delete all records from all tables
    // Order matters due to foreign key relationships: delete relations first, then main entities
    await db.delete(recipeIngredientSchema).run()
    await db.delete(recipeSubRecipeSchema).run()
    await db.delete(recipeSchema).run()
    await db.delete(ingredientSchema).run()

    return {
      type: 'nuke_database',
      success: true,
    }
  } catch (error) {
    return {
      type: 'nuke_database',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
