import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import AdmZip from 'adm-zip'
import { dialog } from 'electron'
import log from 'electron-log/main'
import { v4 as uuidv4 } from 'uuid'
import { ERROR_CODES } from '../../shared/errorCodes'
import { CHANNEL } from '../../shared/messages.types'
import type { RelationDTO } from '../../shared/recipe.types'
import queries from '../database/queries'
import { deleteAllPhotos, deletePhoto, getAllPhotos, getPhotoBytes, savePhotosFromZipData } from '../utilities'
import { typedIpcMain } from './index'

const checkIfComponentExists = async (title: string) => {
  const recipeExists = await queries.recipeExists(title)
  if (recipeExists) {
    return {
      success: false,
      errorCode: ERROR_CODES.RECIPE_EXISTS,
    } as const
  }

  const ingredientExists = await queries.ingredientExists(title)
  if (ingredientExists) {
    return {
      success: false,
      errorCode: ERROR_CODES.INGREDIENT_EXISTS,
    } as const
  }

  return null
}

typedIpcMain.handle(CHANNEL.DB.ADD_RECIPE, async (_event, params) => {
  const exists = await checkIfComponentExists(params.payload.title)
  if (exists) {
    return exists
  }

  let fileName: string | undefined
  if (params.payload.photo) {
    fileName = `${uuidv4()}.${params.payload.photo.extension}`
    await savePhotoBytes(fileName, params.payload.photo.bytes)
  }

  const recipeId = await queries.addRecipe({ ...params.payload, photoSrc: fileName })
  return {
    recipeId,
    success: true,
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
  let fileName: string | undefined
  if (params.payload.newRecipe.photo) {
    fileName = `${uuidv4()}.${params.payload.newRecipe.photo.extension}`
    await savePhotoBytes(fileName, params.payload.newRecipe.photo.bytes)
  }

  const newRecipeId = await queries.addRecipe({ ...params.payload.newRecipe, photoSrc: fileName })
  const newSubRecipeRecipeLink = await queries.addSubRecipeToRecipe({
    parentId: params.payload.parentRecipeId,
    childId: newRecipeId,
    units: params.payload.units,
  })

  if (!newRecipeId || !newSubRecipeRecipeLink) {
    return {
      success: false,
      errorCode: ERROR_CODES.SOMETHING_WENT_WRONG,
    }
  }

  return {
    success: true,
  }
})

typedIpcMain.handle(CHANNEL.DB.ADD_INGREDIENT, async (_event, params) => {
  const exists = await checkIfComponentExists(params.payload.newIngredient.title)
  if (exists) {
    return exists
  }

  const newIngredientId = await queries.addIngredient(params.payload.newIngredient)

  // Ingredient can be added independently or directly to a recipe
  if (params.payload.attachToRecipe && newIngredientId) {
    const newIngredientRecipeLink = await queries.addIngredientToRecipe({
      childId: newIngredientId,
      parentId: params.payload.attachToRecipe.recipeId,
      units: params.payload.units,
      quantity: params.payload.attachToRecipe.recipeQuantity,
    })

    if (!!newIngredientId && !!newIngredientRecipeLink) {
      return {
        success: true,
        ingredientId: newIngredientId,
      }
    }

    return {
      success: false,
      errorCode: ERROR_CODES.SOMETHING_WENT_WRONG,
    }
  }

  return {
    ingredientId: newIngredientId,
    success: true,
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

typedIpcMain.handle(CHANNEL.DB.REMOVE_INGREDIENT_FROM_RECIPE, async (_event, params) => {
  const result = await queries.removeIngredientFromRecipe(params.ingredientId, params.recipeId)
  return {
    type: 'remove_ingredient_from_recipe',
    success: !!result,
  }
})

typedIpcMain.handle(CHANNEL.DB.REMOVE_SUB_RECIPE_FROM_RECIPE, async (_event, params) => {
  const result = await queries.removeSubRecipeFromRecipe(params.subRecipeId, params.recipeId)
  return {
    type: 'remove_sub_recipe_from_recipe',
    success: !!result,
  }
})

typedIpcMain.handle(CHANNEL.DB.UPDATE_INGREDIENT, async (_event, params) => {
  const { areUnitsCompatible, convertUnits } = await import('../../shared/unitConversion.js')

  // Check if units are being changed
  if (params.payload.units !== undefined) {
    const currentIngredient = await queries.getIngredient(params.id)
    if (!currentIngredient) {
      return {
        success: false,
        wasConverted: false,
        affectedRecipeCount: 0,
      }
    }

    const oldUnits = currentIngredient.units
    const newUnits = params.payload.units

    // Units are changing
    if (oldUnits !== newUnits) {
      const compatible = areUnitsCompatible(oldUnits, newUnits)

      if (compatible) {
        // Convert unitCost if a new unitCost wasn't explicitly provided
        if (params.payload.unitCost === undefined) {
          const convertedCost = convertUnits({
            from: oldUnits,
            to: newUnits,
            value: currentIngredient.unitCost,
          })
          if (convertedCost !== null) {
            params.payload.unitCost = convertedCost
          }
        }

        // Convert all relation quantities in recipes using this ingredient
        const affectedRecipeCount = await queries.convertIngredientRelationQuantities(
          params.id,
          oldUnits,
          newUnits,
          convertUnits,
        )

        const result = await queries.updateIngredient(params.id, params.payload)
        return {
          success: !!result,
          wasConverted: true,
          affectedRecipeCount,
        }
      } else {
        // Incompatible units - reset all relation quantities
        const affectedRecipeCount = await queries.resetIngredientRelationQuantities(params.id)
        const result = await queries.updateIngredient(params.id, params.payload)
        return {
          success: !!result,
          wasConverted: false,
          affectedRecipeCount,
        }
      }
    }
  }

  // No unit change, just update normally
  const result = await queries.updateIngredient(params.id, params.payload)
  return {
    success: !!result,
    wasConverted: false,
    affectedRecipeCount: 0,
  }
})

typedIpcMain.handle(CHANNEL.DB.UPDATE_RECIPE, async (_event, params) => {
  const { areUnitsCompatible, convertUnits } = await import('../../shared/unitConversion.js')

  const recipe = await queries.getRecipe(params.id)
  if (!recipe) {
    return {
      success: false,
      affectedRecipeCount: 0,
    }
  }

  let fileName: string | undefined = recipe.photoSrc
  if (params.payload.photo) {
    fileName = `${uuidv4()}.${params.payload.photo.extension}`
    await savePhotoBytes(fileName, params.payload.photo.bytes)
    await deletePhoto(recipe.photoSrc)
  }

  // Check if units are being changed
  if (params.payload.units !== undefined) {
    const oldUnits = recipe.units
    const newUnits = params.payload.units

    // Units are changing
    if (oldUnits !== newUnits) {
      const compatible = areUnitsCompatible(oldUnits, newUnits)

      if (compatible) {
        // Compatible units - convert sub-recipe relation quantities, do NOT modify produces value
        const affectedRecipeCount = await queries.convertSubRecipeRelationQuantities(
          params.id,
          oldUnits,
          newUnits,
          convertUnits,
        )

        const result = await queries.updateRecipe(params.id, { ...params.payload, photoSrc: fileName })
        return {
          success: !!result,
          affectedRecipeCount,
        }
      } else {
        // Incompatible units - reset all sub-recipe relation quantities where this recipe is a child
        const affectedRecipeCount = await queries.resetSubRecipeRelationQuantities(params.id)
        const result = await queries.updateRecipe(params.id, { ...params.payload, photoSrc: fileName })
        return {
          success: !!result,
          affectedRecipeCount,
        }
      }
    }
  }

  // No unit change, just update normally
  const result = await queries.updateRecipe(params.id, { ...params.payload, photoSrc: fileName })
  return {
    success: !!result,
    affectedRecipeCount: 0,
  }
})

typedIpcMain.handle(CHANNEL.DB.DELETE_RECIPE, async (_event, params) => {
  try {
    // Get the recipe to check if it has a photo that needs to be deleted
    const recipe = await queries.getRecipe(params.id)

    // Delete the recipe and all its relationships
    const result = await queries.deleteRecipe(params.id)

    // Delete the associated photo file if it exists
    if (recipe?.photoSrc) {
      await deletePhoto(recipe.photoSrc)
    }

    return {
      success: !!result,
    }
  } catch (error) {
    log.error('Error deleting recipe:', error)
    return {
      success: false,
    }
  }
})

typedIpcMain.handle(CHANNEL.DB.DELETE_INGREDIENT, async (_event, params) => {
  try {
    // Delete the ingredient and all its relationships
    const result = await queries.deleteIngredient(params.id)

    return {
      success: !!result,
    }
  } catch (error) {
    log.error('Error deleting ingredient:', error)
    return {
      success: false,
    }
  }
})

typedIpcMain.handle(CHANNEL.DB.ADD_EXISTING_TO_RECIPE, async (_event, params) => {
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
})

typedIpcMain.handle(CHANNEL.DB.UPDATE_RECIPE_RELATION, async (_event, params) => {
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
})

typedIpcMain.handle(CHANNEL.DB.GET_CATEGORIES, async () => {
  return {
    categories: await queries.getCategories(),
  }
})

typedIpcMain.handle(CHANNEL.DB.ADD_CATEGORY, async (_event, params) => {
  try {
    const categoryId = await queries.addCategory(params.payload)
    return { success: true, categoryId }
  } catch (error) {
    log.error('Error adding category:', error)
    return { success: false, errorCode: ERROR_CODES.SOMETHING_WENT_WRONG }
  }
})

typedIpcMain.handle(CHANNEL.DB.UPDATE_CATEGORY, async (_event, params) => {
  try {
    const result = await queries.updateCategory(params.id, params.payload)
    return { success: !!result }
  } catch (error) {
    log.error('Error updating category:', error)
    return { success: false }
  }
})

typedIpcMain.handle(CHANNEL.DB.DELETE_CATEGORY, async (_event, params) => {
  try {
    const result = await queries.deleteCategory(params.id)
    return { success: !!result }
  } catch (error) {
    log.error('Error deleting category:', error)
    return { success: false }
  }
})

import { app } from 'electron'
import { savePhotoBytes } from '../utilities'

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
    const categories = await queries.getCategories()
    const photos = getAllPhotos()

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

    // Create ZIP archive
    const zip = new AdmZip()

    // Add data.json to ZIP
    const data = {
      version: '1.0',
      ingredients: ingredients || [],
      recipes: recipes || [],
      relations,
      categories: categories || [],
    }
    zip.addFile('data.json', Buffer.from(JSON.stringify(data, null, 2), 'utf8'))

    // Add photos to ZIP in photos/ folder
    for (const photo of photos) {
      zip.addFile(`photos/${photo.filename}`, photo.data)
    }

    // Generate ZIP buffer
    const zipBuffer = zip.toBuffer()

    return {
      type: 'export_all_data',
      success: true,
      data: zipBuffer.toString('base64'),
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
    let data
    let photos: { filename: string; data: Buffer }[] = []

    // Check if data is ZIP format (new) or JSON format (old)
    if (typeof params.data === 'string' && params.data.length > 1000) {
      try {
        // New ZIP format - extract data
        const zipBuffer = Buffer.from(params.data, 'base64')
        const zip = new AdmZip(zipBuffer)

        // Extract data.json
        const dataEntry = zip.getEntry('data.json')
        if (!dataEntry) {
          throw new Error('data.json not found in ZIP archive')
        }
        data = JSON.parse(dataEntry.getData().toString('utf8'))

        // Extract photos
        const entries = zip.getEntries()
        for (const entry of entries) {
          if (entry.entryName.startsWith('photos/') && !entry.isDirectory) {
            const filename = path.basename(entry.entryName)
            photos.push({
              filename,
              data: entry.getData(),
            })
          }
        }
      } catch (zipError) {
        // Fallback to old compressed format
        try {
          const compressedBuffer = Buffer.from(params.data, 'base64')
          const decompressedBuffer = zlib.gunzipSync(compressedBuffer)
          const oldData = JSON.parse(decompressedBuffer.toString('utf8'))

          // Convert old format to new format
          data = {
            ingredients: oldData.ingredients,
            recipes: oldData.recipes,
            relations: oldData.relations,
          }

          // Extract photos from old format
          if (oldData.photos) {
            photos = oldData.photos.map((photo: any) => ({
              filename: photo.filename,
              data: Buffer.from(photo.data, 'base64'),
            }))
          }
        } catch (gzipError) {
          console.log(gzipError)
          throw new Error('Invalid backup file format')
        }
      }
    } else {
      // Old JSON format
      data = params.data
    }

    // This is a destructive operation - wipe all existing data first
    const { db } = await import('../database/client.js')
    const { recipeSchema, ingredientSchema, recipeIngredientSchema, recipeSubRecipeSchema, categorySchema } =
      await import('../database/schema.js')

    // Delete all records from all tables
    await db.delete(recipeIngredientSchema).run()
    await db.delete(recipeSubRecipeSchema).run()
    await db.delete(recipeSchema).run()
    await db.delete(ingredientSchema).run()
    await db.delete(categorySchema).run()

    // Delete all existing photos
    deleteAllPhotos()

    // Restore photos
    if (photos.length > 0) {
      savePhotosFromZipData(photos)
    }

    // Insert new data
    const { ingredients, recipes, relations } = data
    const categories = data.categories || [] // Handle old backups without categories

    // Keep track of old ID -> new ID mappings
    const ingredientIdMap = new Map<string, string>()
    const recipeIdMap = new Map<string, string>()
    const categoryIdMap = new Map<string, string>()

    // Insert categories first (recipes reference them)
    for (const category of categories) {
      const newCategoryId = await queries.addCategory({
        title: category.title,
      })
      categoryIdMap.set(category.id, newCategoryId)
    }

    // Insert ingredients
    for (const ingredient of ingredients) {
      const newIngredientId = await queries.addIngredient({
        title: ingredient.title,
        unitCost: ingredient.unitCost,
        units: ingredient.units,
      })
      ingredientIdMap.set(ingredient.id, newIngredientId)
    }

    // Insert recipes
    for (const recipe of recipes) {
      const newCategoryId = recipe.categoryId ? categoryIdMap.get(recipe.categoryId) || null : null
      const newRecipeId = await queries.addRecipe({
        title: recipe.title,
        produces: recipe.produces,
        units: recipe.units,
        status: recipe.status,
        showInMenu: recipe.showInMenu,
        photoSrc: recipe.photoSrc,
        categoryId: newCategoryId,
      })
      recipeIdMap.set(recipe.id, newRecipeId)
    }

    // Insert relations
    for (const relation of relations) {
      const newParentId = recipeIdMap.get(relation.parentId)
      if (!newParentId) {
        log.warn(`Could not find new parent ID for relation: ${relation.parentId}`)
        continue
      }

      if (relation.type === 'ingredient') {
        const newChildId = ingredientIdMap.get(relation.childId)
        if (!newChildId) {
          log.warn(`Could not find new ingredient ID for relation: ${relation.childId}`)
          continue
        }
        await queries.addIngredientToRecipe({
          parentId: newParentId,
          childId: newChildId,
          units: relation.units,
          quantity: relation.quantity,
        })
        await queries.updateRecipeRelation(newParentId, newChildId, 'ingredient', relation.quantity, relation.units)
      } else if (relation.type === 'sub-recipe') {
        const newChildId = recipeIdMap.get(relation.childId)
        if (!newChildId) {
          log.warn(`Could not find new recipe ID for relation: ${relation.childId}`)
          continue
        }
        await queries.addSubRecipeToRecipe({
          parentId: newParentId,
          childId: newChildId,
          units: relation.units,
        })
        await queries.updateRecipeRelation(newParentId, newChildId, 'sub-recipe', relation.quantity, relation.units)
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
    const { recipeSchema, ingredientSchema, recipeIngredientSchema, recipeSubRecipeSchema, categorySchema } =
      await import('../database/schema.js')

    // Delete all records from all tables
    // Order matters due to foreign key relationships: delete relations first, then main entities
    await db.delete(recipeIngredientSchema).run()
    await db.delete(recipeSubRecipeSchema).run()
    await db.delete(recipeSchema).run()
    await db.delete(ingredientSchema).run()
    await db.delete(categorySchema).run()

    // Delete all photos
    deleteAllPhotos()

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

typedIpcMain.handle(CHANNEL.FILES.GET_PHOTO, async (_event, params) => {
  try {
    const data = await getPhotoBytes(params.fileName)
    return {
      data,
    }
  } catch (error) {
    log.error('Error getting photo:', error)
    return {
      data: null,
    }
  }
})

typedIpcMain.handle(CHANNEL.FILES.EXPORT_RECIPES_PDF, async (_event, params) => {
  try {
    const savedPaths: string[] = []

    if (params.oneFilePerRecipe) {
      // For multiple files, show a directory picker
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Choose directory to save recipe PDFs',
      })

      if (result.canceled || !result.filePaths[0]) {
        return {
          success: false,
          error: 'Directory selection was canceled',
        }
      }

      const directory = result.filePaths[0]

      // Save each PDF to the directory
      for (const pdf of params.pdfs) {
        const filePath = path.join(directory, `${pdf.filename}.pdf`)
        fs.writeFileSync(filePath, pdf.data)
        savedPaths.push(filePath)
      }
    } else {
      // Single file, show save dialog
      const result = await dialog.showSaveDialog({
        defaultPath: `${params.pdfs[0].filename}.pdf`,
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['createDirectory'],
      })

      if (result.canceled || !result.filePath) {
        return {
          success: false,
          error: 'Save operation was canceled',
        }
      }

      // Save the single PDF
      fs.writeFileSync(result.filePath, params.pdfs[0].data)
      savedPaths.push(result.filePath)
    }

    return {
      success: true,
      savedPaths,
    }
  } catch (error) {
    log.error('Error in export recipes PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
