import { and, eq } from 'drizzle-orm'
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
  const recipes = await db.select().from(recipeSchema).all()
  return recipes
}

const getRecipe = async (id: string) => {
  const recipes = await db
    .select()
    .from(recipeSchema)
    .where(eq(recipeSchema.id, id))
  return recipes[0]
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

const getIngredients = async () => {
  const ingredients = await db.select().from(ingredientSchema).all()
  return ingredients
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
): Promise<
  { success: true; cost: number } | { success: false; error: string }
> => {
  // Helper function to recursively calculate cost with circular dependency detection
  const calculateCostRecursive = async (
    currentRecipeId: string,
    ancestorPath: string[] = [],
  ): Promise<
    { success: true; cost: number } | { success: false; error: string }
  > => {
    // Check for circular dependency
    if (ancestorPath.includes(currentRecipeId)) {
      const parentId = ancestorPath[ancestorPath.length - 1]
      return {
        success: false,
        error: `Found ${currentRecipeId} as child of ${parentId} and can't continue`,
      }
    }

    let totalCost = 0
    const newPath = [...ancestorPath, currentRecipeId]

    // Get direct ingredients for this recipe
    const ingredients = await getRecipeIngredients(currentRecipeId)

    // Calculate cost from direct ingredients
    for (const ingredient of ingredients) {
      if (ingredient) {
        // Convert ingredient quantity to recipe units if needed
        const ingredientCost = ingredient.cost || 0
        const ingredientQuantity = ingredient.quantity || 0
        const relationQuantity = ingredient.relation?.quantity || 0

        // Cost per unit of ingredient * quantity used in recipe
        const ingredientTotalCost =
          (ingredientCost / ingredientQuantity) * relationQuantity
        totalCost += ingredientTotalCost
      }
    }

    // Get sub-recipes for this recipe
    const subRecipes = await getRecipeSubRecipes(currentRecipeId)

    // Recursively calculate cost from sub-recipes
    for (const subRecipe of subRecipes) {
      if (subRecipe) {
        const subRecipeResult = await calculateCostRecursive(
          subRecipe.id,
          newPath,
        )

        if (!subRecipeResult.success) {
          return subRecipeResult // Propagate error up the chain
        }

        const relationQuantity = subRecipe.relation?.quantity || 0
        const subRecipeProduces = subRecipe.produces || 1

        // Cost of sub-recipe * (quantity needed / quantity it produces)
        const subRecipeCostContribution =
          subRecipeResult.cost * (relationQuantity / subRecipeProduces)
        totalCost += subRecipeCostContribution
      }
    }

    return { success: true, cost: totalCost }
  }

  return await calculateCostRecursive(recipeId)
}

export default {
  addRecipe,
  getRecipes,
  getRecipe,
  getRecipeIngredients,
  addIngredient,
  addIngredientToRecipe,
  getIngredients,
  removeIngredientFromRecipe,
  removeSubRecipeFromRecipe,
  addSubRecipeToRecipe,
  getRecipeSubRecipes,
  updateIngredient,
  updateRecipe,
  updateRecipeRelation,
  getRecipeCost,
}
