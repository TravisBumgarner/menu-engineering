import { and, count, eq } from 'drizzle-orm'
import log from 'electron-log/main'
import type {
  NewCategoryDTO,
  NewIngredientDTO,
  NewIngredientInRecipeDTO,
  NewRecipeDTO,
  NewSubRecipeInRecipeDTO,
  RecipeDTO,
} from 'src/shared/recipe.types'
import type { AllUnits } from 'src/shared/units.types'
import { v4 as uuidv4 } from 'uuid'
import { db } from './client'
import { lower } from './functions'
import {
  categorySchema,
  ingredientSchema,
  recipeCategorySchema,
  recipeIngredientSchema,
  recipeSchema,
  recipeSubRecipeSchema,
} from './schema'

const addRecipe = async (recipeData: NewRecipeDTO & { photoSrc?: RecipeDTO['photoSrc'] }) => {
  const newId = uuidv4()
  const { categoryIds, photo, ...recipeFields } = recipeData as NewRecipeDTO & { photoSrc?: string; photo?: unknown }

  await db
    .insert(recipeSchema)
    .values({ id: newId, ...recipeFields })
    .run()

  if (categoryIds && categoryIds.length > 0) {
    await setRecipeCategories(newId, categoryIds)
  }

  return newId
}

const hasRecipeZeroQuantity = async (recipeId: string): Promise<boolean> => {
  const ingredients = await db
    .select({ quantity: recipeIngredientSchema.quantity })
    .from(recipeIngredientSchema)
    .where(eq(recipeIngredientSchema.parentId, recipeId))
    .all()

  if (ingredients.some((i) => i.quantity === 0)) {
    return true
  }

  const subRecipes = await db
    .select({ quantity: recipeSubRecipeSchema.quantity })
    .from(recipeSubRecipeSchema)
    .where(eq(recipeSubRecipeSchema.parentId, recipeId))
    .all()

  return subRecipes.some((s) => s.quantity === 0)
}

const getRecipes = async () => {
  const rows = await db
    .select({
      recipe: recipeSchema,
      usedInRecipesCount: count(recipeSubRecipeSchema.id),
    })
    .from(recipeSchema)
    .leftJoin(recipeSubRecipeSchema, eq(recipeSchema.id, recipeSubRecipeSchema.childId))
    .groupBy(recipeSchema.id)
    .all()

  const allJunctionRows = await db.select().from(recipeCategorySchema).all()
  const categoryMap = new Map<string, string[]>()
  for (const row of allJunctionRows) {
    const existing = categoryMap.get(row.recipeId) || []
    existing.push(row.categoryId)
    categoryMap.set(row.recipeId, existing)
  }

  return Promise.all(
    rows.map(async (row) => {
      const costResult = await getRecipeCost(row.recipe.id)
      const hasZeroQuantity = await hasRecipeZeroQuantity(row.recipe.id)

      return {
        ...row.recipe,
        categoryIds: categoryMap.get(row.recipe.id) || [],
        usedInRecipesCount: row.usedInRecipesCount,
        cost: costResult.success ? costResult.cost : null,
        hasZeroQuantity,
      }
    }),
  )
}

const getRecipe = async (id: string) => {
  const recipe = await db.select().from(recipeSchema).where(eq(recipeSchema.id, id))

  const usedInRecipes = await db
    .select({
      recipe: recipeSchema,
    })
    .from(recipeSubRecipeSchema)
    .where(eq(recipeSubRecipeSchema.childId, id))
    .leftJoin(recipeSchema, eq(recipeSubRecipeSchema.parentId, recipeSchema.id))

  const junctionRows = await db
    .select()
    .from(recipeCategorySchema)
    .where(eq(recipeCategorySchema.recipeId, id))
  const categoryIds = junctionRows.map((row) => row.categoryId)

  const costResult = await getRecipeCost(id)

  return {
    ...recipe[0],
    categoryIds,
    usedInRecipes: usedInRecipes.map((row) => row.recipe).filter(Boolean),
    cost: costResult.success ? costResult.cost : -1,
  }
}

const addIngredient = async (ingredientData: NewIngredientDTO) => {
  const newId = uuidv4()

  await db
    .insert(ingredientSchema)
    .values({ id: newId, ...ingredientData })
    .run()

  return newId
}

const addIngredientToRecipe = async (newIngredientInRecipe: NewIngredientInRecipeDTO) => {
  const newId = uuidv4()
  await db
    .insert(recipeIngredientSchema)
    .values({ id: newId, ...newIngredientInRecipe })
    .run()

  return newId
}

const getRecipeIngredients = async (recipeId: string) => {
  const ingredients = await db
    .select({
      ingredient: ingredientSchema,
      recipeQuantity: recipeIngredientSchema.quantity,
      recipeUnits: recipeIngredientSchema.units,
    })
    .from(recipeIngredientSchema)
    .where(eq(recipeIngredientSchema.parentId, recipeId))
    .leftJoin(ingredientSchema, eq(recipeIngredientSchema.childId, ingredientSchema.id))
  return ingredients.map((row) => ({
    ...row.ingredient,
    relation: { quantity: row.recipeQuantity, units: row.recipeUnits },
  }))
}

const ingredientExists = async (title: string) => {
  const ingredientResult = await db
    .select()
    .from(ingredientSchema)
    .where(eq(lower(ingredientSchema.title), title.toLowerCase()))
    .limit(1)

  return ingredientResult.length > 0 ? ingredientResult[0] : null
}

const recipeExists = async (title: string) => {
  const recipeResult = await db
    .select()
    .from(recipeSchema)
    .where(eq(lower(recipeSchema.title), title.toLowerCase()))
    .limit(1)

  return recipeResult.length > 0 ? recipeResult[0] : null
}

const getIngredient = async (id: string) => {
  const ingredientResult = await db.select().from(ingredientSchema).where(eq(ingredientSchema.id, id)).limit(1)

  return ingredientResult[0]
}

const getIngredients = async () => {
  const ingredients = await db
    .select({
      ingredient: ingredientSchema,
      recipeCount: count(recipeIngredientSchema.id),
    })
    .from(ingredientSchema)
    .leftJoin(recipeIngredientSchema, eq(ingredientSchema.id, recipeIngredientSchema.childId))
    .groupBy(ingredientSchema.id)
    .all()

  return ingredients.map((row) => ({
    ...row.ingredient,
    recipeCount: row.recipeCount,
  }))
}

const removeIngredientFromRecipe = async (ingredientId: string, recipeId: string) => {
  const result = await db
    .delete(recipeIngredientSchema)
    .where(and(eq(recipeIngredientSchema.childId, ingredientId), eq(recipeIngredientSchema.parentId, recipeId)))
    .run()

  return result
}

const removeSubRecipeFromRecipe = async (subRecipeId: string, recipeId: string) => {
  const result = await db
    .delete(recipeSubRecipeSchema)
    .where(and(eq(recipeSubRecipeSchema.childId, subRecipeId), eq(recipeSubRecipeSchema.parentId, recipeId)))
    .run()

  return result
}

const addSubRecipeToRecipe = async (newSubRecipeInRecipeDTO: NewSubRecipeInRecipeDTO) => {
  const newId = uuidv4()
  await db
    .insert(recipeSubRecipeSchema)
    .values({ id: newId, ...newSubRecipeInRecipeDTO })
    .run()

  return newId
}

const getRecipeSubRecipes = async (recipeId: string) => {
  const recipes = await db
    .select({
      recipe: recipeSchema,
      recipeQuantity: recipeSubRecipeSchema.quantity,
      recipeUnits: recipeSubRecipeSchema.units,
    })
    .from(recipeSubRecipeSchema)
    .where(eq(recipeSubRecipeSchema.parentId, recipeId))
    .leftJoin(recipeSchema, eq(recipeSubRecipeSchema.childId, recipeSchema.id))

  return Promise.all(
    recipes.map(async (row) => {
      const costResult = await getRecipeCost(row.recipe.id)
      return {
        cost: costResult.success ? costResult.cost : -1,
        ...row.recipe,
        relation: { quantity: row.recipeQuantity, units: row.recipeUnits },
      }
    }),
  )
}

const updateIngredient = async (id: string, ingredientData: Partial<NewIngredientDTO>) => {
  const result = await db.update(ingredientSchema).set(ingredientData).where(eq(ingredientSchema.id, id)).run()

  return result
}

const updateRecipe = async (id: string, recipeData: Partial<RecipeDTO>) => {
  const { categoryIds, photo, ...recipeFields } = recipeData as Partial<RecipeDTO> & { photo?: unknown }

  const result = await db.update(recipeSchema).set(recipeFields).where(eq(recipeSchema.id, id)).run()

  if (categoryIds !== undefined) {
    await setRecipeCategories(id, categoryIds)
  }

  return result
}

const updateRecipeRelation = async (
  parentId: string,
  childId: string,
  type: 'ingredient' | 'sub-recipe',
  quantity?: number,
  units?: AllUnits,
) => {
  const updateData: { quantity?: number; units?: AllUnits; updatedAt: string } = {
    updatedAt: new Date().toISOString(),
  }

  if (quantity !== undefined) {
    updateData.quantity = quantity
  }

  if (units !== undefined) {
    updateData.units = units
  }

  if (type === 'ingredient') {
    const result = await db
      .update(recipeIngredientSchema)
      .set(updateData)
      .where(and(eq(recipeIngredientSchema.parentId, parentId), eq(recipeIngredientSchema.childId, childId)))
      .run()
    return result
  } else {
    const result = await db
      .update(recipeSubRecipeSchema)
      .set(updateData)
      .where(and(eq(recipeSubRecipeSchema.parentId, parentId), eq(recipeSubRecipeSchema.childId, childId)))
      .run()
    return result
  }
}

const getRecipeCost = async (
  recipeId: string,
  depth = 0,
): Promise<{ success: true; cost: number } | { success: false; error: string }> => {
  try {
    if (depth > 5) {
      throw new Error('Maximum recursion depth exceeded')
    }
    let totalCost = 0

    // 1️⃣ INGREDIENT COSTS (direct)
    const ingredients = await getRecipeIngredients(recipeId)
    for (const ing of ingredients) {
      const usedQty = ing.relation.quantity
      totalCost += ing.unitCost * usedQty
    }

    // 2️⃣ SUB-RECIPE COSTS (recursive)
    const subRecipes = await getRecipeSubRecipes(recipeId)
    for (const subRecipe of subRecipes) {
      const subCostResult = await getRecipeCost(subRecipe.id, depth + 1)
      if (subCostResult.success) {
        const usedQty = subRecipe.relation.quantity
        const costPerUnit = subCostResult.cost / subRecipe.produces
        totalCost += costPerUnit * usedQty
      } else {
        throw new Error(`Failed to get cost for sub-recipe ${subRecipe.id}`)
      }
    }

    return { success: true, cost: totalCost }
  } catch (err) {
    log.error(err)
    return { success: false, error: String(err) }
  }
}

const getRecipesUsingSubRecipe = async (subRecipeId: string) => {
  const recipes = await db
    .select({
      recipe: recipeSchema,
      relationQuantity: recipeSubRecipeSchema.quantity,
      relationUnits: recipeSubRecipeSchema.units,
    })
    .from(recipeSubRecipeSchema)
    .where(eq(recipeSubRecipeSchema.childId, subRecipeId))
    .leftJoin(recipeSchema, eq(recipeSubRecipeSchema.parentId, recipeSchema.id))

  return Promise.all(
    recipes.map(async (row) => {
      const costResult = await getRecipeCost(row.recipe.id)
      return {
        ...row.recipe,
        cost: costResult.success ? costResult.cost : -1,
        relationQuantity: row.relationQuantity,
        relationUnits: row.relationUnits,
      }
    }),
  ).then((results) => results.filter(Boolean))
}

const getRecipesUsingIngredient = async (ingredientId: string) => {
  const recipes = await db
    .select({
      recipe: recipeSchema,
      relationQuantity: recipeIngredientSchema.quantity,
      relationUnits: recipeIngredientSchema.units,
    })
    .from(recipeIngredientSchema)
    .where(eq(recipeIngredientSchema.childId, ingredientId))
    .leftJoin(recipeSchema, eq(recipeIngredientSchema.parentId, recipeSchema.id))

  return Promise.all(
    recipes.map(async (row) => {
      const costResult = await getRecipeCost(row.recipe.id)
      return {
        ...row.recipe,
        cost: costResult.success ? costResult.cost : -1,
        relationQuantity: row.relationQuantity,
        relationUnits: row.relationUnits,
      }
    }),
  ).then((results) => results.filter(Boolean))
}

const deleteRecipe = async (recipeId: string) => {
  try {
    // Delete in order to maintain foreign key constraints
    // 1. Delete all category associations
    await db.delete(recipeCategorySchema).where(eq(recipeCategorySchema.recipeId, recipeId)).run()

    // 2. Delete all ingredient relationships for this recipe
    await db.delete(recipeIngredientSchema).where(eq(recipeIngredientSchema.parentId, recipeId)).run()

    // 3. Delete all sub-recipe relationships where this recipe is the parent
    await db.delete(recipeSubRecipeSchema).where(eq(recipeSubRecipeSchema.parentId, recipeId)).run()

    // 4. Delete all sub-recipe relationships where this recipe is used as a sub-recipe
    await db.delete(recipeSubRecipeSchema).where(eq(recipeSubRecipeSchema.childId, recipeId)).run()

    // 5. Finally, delete the recipe itself
    const result = await db.delete(recipeSchema).where(eq(recipeSchema.id, recipeId)).run()

    return result
  } catch (error) {
    log.error('Error deleting recipe:', error)
    throw error
  }
}

const deleteIngredient = async (ingredientId: string) => {
  try {
    // Delete in order to maintain foreign key constraints
    // 1. Delete all recipe-ingredient relationships where this ingredient is used
    await db.delete(recipeIngredientSchema).where(eq(recipeIngredientSchema.childId, ingredientId)).run()

    // 2. Finally, delete the ingredient itself
    const result = await db.delete(ingredientSchema).where(eq(ingredientSchema.id, ingredientId)).run()

    return result
  } catch (error) {
    log.error('Error deleting ingredient:', error)
    throw error
  }
}

/**
 * Reset the quantity to 0 for all recipe-ingredient relationships where this ingredient is used.
 * This is called when an ingredient's units change to an incompatible type.
 * @param ingredientId - The ingredient whose relation quantities should be reset
 * @returns The number of affected recipe-ingredient relations
 */
const resetIngredientRelationQuantities = async (ingredientId: string) => {
  const result = await db
    .update(recipeIngredientSchema)
    .set({ quantity: 0, updatedAt: new Date().toISOString() })
    .where(eq(recipeIngredientSchema.childId, ingredientId))
    .run()

  return result.changes
}

/**
 * Convert quantities for all recipe-ingredient relationships where this ingredient is used.
 * This is called when an ingredient's units change to a compatible type.
 * @param ingredientId - The ingredient whose relation quantities should be converted
 * @param fromUnits - The original units
 * @param toUnits - The new units
 * @param convertFn - Function to convert values between units
 * @returns The number of affected recipe-ingredient relations
 */
const convertIngredientRelationQuantities = async (
  ingredientId: string,
  fromUnits: AllUnits,
  toUnits: AllUnits,
  convertFn: (params: { from: AllUnits; to: AllUnits; value: number }) => number | null,
) => {
  // Get all relations for this ingredient
  const relations = await db
    .select()
    .from(recipeIngredientSchema)
    .where(eq(recipeIngredientSchema.childId, ingredientId))

  let convertedCount = 0
  for (const relation of relations) {
    const convertedQuantity = convertFn({
      from: fromUnits,
      to: toUnits,
      value: relation.quantity,
    })

    if (convertedQuantity !== null) {
      await db
        .update(recipeIngredientSchema)
        .set({
          quantity: convertedQuantity,
          units: toUnits,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(recipeIngredientSchema.id, relation.id))
        .run()
      convertedCount++
    }
  }

  return convertedCount
}

/**
 * Get the count of recipes using a specific ingredient
 * @param ingredientId - The ingredient to check
 * @returns The number of recipes using this ingredient
 */
const getIngredientRelationCount = async (ingredientId: string) => {
  const result = await db
    .select({ count: count() })
    .from(recipeIngredientSchema)
    .where(eq(recipeIngredientSchema.childId, ingredientId))

  return result[0]?.count ?? 0
}

/**
 * Reset the quantity to 0 for all sub-recipe relationships where this recipe is used as a child.
 * This is called when a recipe's units change to an incompatible type.
 * @param recipeId - The recipe whose sub-recipe relation quantities should be reset
 * @returns The number of affected sub-recipe relations
 */
const resetSubRecipeRelationQuantities = async (recipeId: string) => {
  const result = await db
    .update(recipeSubRecipeSchema)
    .set({ quantity: 0, updatedAt: new Date().toISOString() })
    .where(eq(recipeSubRecipeSchema.childId, recipeId))
    .run()

  return result.changes
}

/**
 * Get the count of parent recipes using a specific recipe as a sub-recipe
 * @param recipeId - The recipe to check
 * @returns The number of parent recipes using this recipe as a sub-recipe
 */
const getSubRecipeRelationCount = async (recipeId: string) => {
  const result = await db
    .select({ count: count() })
    .from(recipeSubRecipeSchema)
    .where(eq(recipeSubRecipeSchema.childId, recipeId))

  return result[0]?.count ?? 0
}

/**
 * Convert quantities for all sub-recipe relationships where this recipe is used as a child.
 * This is called when a recipe's units change to a compatible type.
 * @param recipeId - The recipe whose sub-recipe relation quantities should be converted
 * @param fromUnits - The original units
 * @param toUnits - The new units
 * @param convertFn - Function to convert values between units
 * @returns The number of affected sub-recipe relations
 */
const convertSubRecipeRelationQuantities = async (
  recipeId: string,
  fromUnits: AllUnits,
  toUnits: AllUnits,
  convertFn: (params: { from: AllUnits; to: AllUnits; value: number }) => number | null,
) => {
  // Get all relations where this recipe is used as a sub-recipe
  const relations = await db
    .select()
    .from(recipeSubRecipeSchema)
    .where(eq(recipeSubRecipeSchema.childId, recipeId))

  let convertedCount = 0
  for (const relation of relations) {
    const convertedQuantity = convertFn({
      from: fromUnits,
      to: toUnits,
      value: relation.quantity,
    })

    if (convertedQuantity !== null) {
      await db
        .update(recipeSubRecipeSchema)
        .set({
          quantity: convertedQuantity,
          units: toUnits,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(recipeSubRecipeSchema.id, relation.id))
        .run()
      convertedCount++
    }
  }

  return convertedCount
}

const getCategories = async () => {
  return db.select().from(categorySchema).all()
}

const addCategory = async (data: NewCategoryDTO) => {
  const newId = uuidv4()
  await db
    .insert(categorySchema)
    .values({ id: newId, ...data })
    .run()
  return newId
}

const updateCategory = async (id: string, data: Partial<NewCategoryDTO>) => {
  const result = await db
    .update(categorySchema)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(categorySchema.id, id))
    .run()
  return result
}

const deleteCategory = async (id: string) => {
  await db.delete(recipeCategorySchema).where(eq(recipeCategorySchema.categoryId, id)).run()
  const result = await db.delete(categorySchema).where(eq(categorySchema.id, id)).run()
  return result
}

const setRecipeCategories = async (recipeId: string, categoryIds: string[]) => {
  await db.delete(recipeCategorySchema).where(eq(recipeCategorySchema.recipeId, recipeId)).run()
  for (const categoryId of categoryIds) {
    await db
      .insert(recipeCategorySchema)
      .values({ id: uuidv4(), recipeId, categoryId })
      .run()
  }
}

export default {
  addRecipe,
  getRecipes,
  getRecipe,
  getRecipeIngredients,
  addIngredient,
  addIngredientToRecipe,
  getIngredient,
  getIngredients,
  removeIngredientFromRecipe,
  removeSubRecipeFromRecipe,
  addSubRecipeToRecipe,
  getRecipeSubRecipes,
  getRecipesUsingSubRecipe,
  updateIngredient,
  updateRecipe,
  updateRecipeRelation,
  getRecipeCost,
  getRecipesUsingIngredient,
  deleteRecipe,
  deleteIngredient,
  recipeExists,
  ingredientExists,
  resetIngredientRelationQuantities,
  convertIngredientRelationQuantities,
  getIngredientRelationCount,
  resetSubRecipeRelationQuantities,
  convertSubRecipeRelationQuantities,
  getSubRecipeRelationCount,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  setRecipeCategories,
}
