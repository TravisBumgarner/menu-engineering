import { and, count, eq } from 'drizzle-orm'
import {
  NewIngredientDTO,
  NewIngredientInRecipeDTO,
  NewRecipeDTO,
  NewSubRecipeInRecipeDTO,
} from 'src/shared/recipe.types'
import { AllUnits } from 'src/shared/units.types'
import { v4 as uuidv4 } from 'uuid'
import { db } from './client'
import {
  ingredientSchema,
  recipeIngredientSchema,
  recipeSchema,
  recipeSubRecipeSchema,
} from './schema'

const addRecipe = async (recipeData: NewRecipeDTO) => {
  // generate an id required by the schema, then insert
  const newId = uuidv4()

  await db
    .insert(recipeSchema)
    .values({ id: newId, ...recipeData })
    .run()

  return newId
}

const getRecipes = async () => {
  const recipes = await db
    .select({
      recipe: recipeSchema,
      usedInRecipesCount: count(recipeSubRecipeSchema.id),
    })
    .from(recipeSchema)
    .leftJoin(
      recipeSubRecipeSchema,
      eq(recipeSchema.id, recipeSubRecipeSchema.childId),
    )
    .groupBy(recipeSchema.id)
    .all()

  return recipes.map(row => ({
    ...row.recipe,
    usedInRecipesCount: row.usedInRecipesCount,
  }))
}

const getRecipe = async (id: string) => {
  const recipe = await db
    .select()
    .from(recipeSchema)
    .where(eq(recipeSchema.id, id))

  const usedInRecipes = await db
    .select({
      recipe: recipeSchema,
    })
    .from(recipeSubRecipeSchema)
    .where(eq(recipeSubRecipeSchema.childId, id))
    .leftJoin(recipeSchema, eq(recipeSubRecipeSchema.parentId, recipeSchema.id))

  return {
    ...recipe[0],
    usedInRecipes: usedInRecipes.map(row => row.recipe).filter(Boolean),
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

const addIngredientToRecipe = async (
  newIngredientInRecipe: NewIngredientInRecipeDTO,
) => {
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
    .leftJoin(
      ingredientSchema,
      eq(recipeIngredientSchema.childId, ingredientSchema.id),
    )
  return ingredients.map(row => ({
    ...row.ingredient,
    relation: { quantity: row.recipeQuantity, units: row.recipeUnits },
  }))
}

const getIngredient = async (id: string) => {
  const ingredientResult = await db
    .select()
    .from(ingredientSchema)
    .where(eq(ingredientSchema.id, id))
    .limit(1)

  return ingredientResult[0]
}

const getIngredients = async () => {
  const ingredients = await db
    .select({
      ingredient: ingredientSchema,
      recipeCount: count(recipeIngredientSchema.id),
    })
    .from(ingredientSchema)
    .leftJoin(
      recipeIngredientSchema,
      eq(ingredientSchema.id, recipeIngredientSchema.childId),
    )
    .groupBy(ingredientSchema.id)
    .all()

  return ingredients.map(row => ({
    ...row.ingredient,
    recipeCount: row.recipeCount,
  }))
}

const removeIngredientFromRecipe = async (
  ingredientId: string,
  recipeId: string,
) => {
  const result = await db
    .delete(recipeIngredientSchema)
    .where(
      and(
        eq(recipeIngredientSchema.childId, ingredientId),
        eq(recipeIngredientSchema.parentId, recipeId),
      ),
    )
    .run()

  return result
}

const removeSubRecipeFromRecipe = async (
  subRecipeId: string,
  recipeId: string,
) => {
  const result = await db
    .delete(recipeSubRecipeSchema)
    .where(
      and(
        eq(recipeSubRecipeSchema.childId, subRecipeId),
        eq(recipeSubRecipeSchema.parentId, recipeId),
      ),
    )
    .run()

  return result
}

const addSubRecipeToRecipe = async (
  newSubRecipeInRecipeDTO: NewSubRecipeInRecipeDTO,
) => {
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
  return recipes.map(row => ({
    ...row.recipe,
    relation: { quantity: row.recipeQuantity, units: row.recipeUnits },
  }))
}

const updateIngredient = async (
  id: string,
  ingredientData: Partial<NewIngredientDTO>,
) => {
  const result = await db
    .update(ingredientSchema)
    .set(ingredientData)
    .where(eq(ingredientSchema.id, id))
    .run()

  return result
}

const updateRecipe = async (id: string, recipeData: Partial<NewRecipeDTO>) => {
  const result = await db
    .update(recipeSchema)
    .set(recipeData)
    .where(eq(recipeSchema.id, id))
    .run()

  return result
}

const updateRecipeRelation = async (
  parentId: string,
  childId: string,
  type: 'ingredient' | 'sub-recipe',
  quantity?: number,
  units?: AllUnits,
) => {
  const updateData: { quantity?: number; units?: AllUnits; updatedAt: string } =
    {
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
      .where(
        and(
          eq(recipeIngredientSchema.parentId, parentId),
          eq(recipeIngredientSchema.childId, childId),
        ),
      )
      .run()
    return result
  } else {
    const result = await db
      .update(recipeSubRecipeSchema)
      .set(updateData)
      .where(
        and(
          eq(recipeSubRecipeSchema.parentId, parentId),
          eq(recipeSubRecipeSchema.childId, childId),
        ),
      )
      .run()
    return result
  }
}

const getRecipeCost = async (
  recipeId: string,
  depth = 0,
): Promise<
  { success: true; cost: number } | { success: false; error: string }
> => {
  try {
    if (depth > 5) {
      throw new Error('Maximum recursion depth exceeded')
    }
    let totalCost = 0

    // 1️⃣ INGREDIENT COSTS (direct)
    const ingredients = await getRecipeIngredients(recipeId)
    for (const ing of ingredients) {
      const usedQty = ing.relation.quantity
      // TODO: optionally normalize units here if units differ
      totalCost += ing.unitCost * usedQty
    }

    // 2️⃣ SUB-RECIPE COSTS (recursive)
    const subRecipes = await getRecipeSubRecipes(recipeId)
    for (const sub of subRecipes) {
      const subCostResult = await getRecipeCost(sub.id, depth + 1)
      if (subCostResult.success) {
        const usedQty = sub.relation.quantity
        const subRecipe = sub // includes .produces from getRecipeSubRecipes join
        const costPerUnit = subCostResult.cost / (subRecipe.produces || 1)
        totalCost += costPerUnit * usedQty
      }
    }

    return { success: true, cost: totalCost }
  } catch (err) {
    console.error(err)
    return { success: false, error: String(err) }
  }
}

const getRecipesUsingSubRecipe = async (subRecipeId: string) => {
  const recipes = await db
    .select({
      recipe: recipeSchema,
    })
    .from(recipeSubRecipeSchema)
    .where(eq(recipeSubRecipeSchema.childId, subRecipeId))
    .leftJoin(recipeSchema, eq(recipeSubRecipeSchema.parentId, recipeSchema.id))

  return recipes.map(row => row.recipe).filter(Boolean)
}

const getRecipesUsingIngredient = async (ingredientId: string) => {
  const recipes = await db
    .select({
      recipe: recipeSchema,
    })
    .from(recipeIngredientSchema)
    .where(eq(recipeIngredientSchema.childId, ingredientId))
    .leftJoin(
      recipeSchema,
      eq(recipeIngredientSchema.parentId, recipeSchema.id),
    )

  return recipes.map(row => row.recipe).filter(Boolean)
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
}
