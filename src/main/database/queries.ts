import { and, eq } from 'drizzle-orm'
import { NewIngredientDTO, NewRecipeDTO } from 'src/shared/recipe.types'
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

const addIngredientToRecipe = async ({
  ingredientId,
  recipeId,
}: {
  ingredientId: string
  recipeId: string
}) => {
  const newId = uuidv4()
  await db
    .insert(recipeIngredientSchema)
    .values({ id: newId, parentId: recipeId, childId: ingredientId })
    .run()

  return newId
}

const getRecipeIngredients = async (recipeId: string) => {
  const ingredients = await db
    .select({ ingredient: ingredientSchema })
    .from(recipeIngredientSchema)
    .where(eq(recipeIngredientSchema.parentId, recipeId))
    .leftJoin(
      ingredientSchema,
      eq(recipeIngredientSchema.childId, ingredientSchema.id),
    )
  return ingredients.map(row => row.ingredient)
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

const addSubRecipeToRecipe = async ({
  parentRecipeId,
  childRecipeId,
}: {
  parentRecipeId: string
  childRecipeId: string
}) => {
  const newId = uuidv4()
  await db
    .insert(recipeSubRecipeSchema)
    .values({ id: newId, parentId: parentRecipeId, childId: childRecipeId })
    .run()

  return newId
}

const getRecipeSubRecipes = async (recipeId: string) => {
  const recipes = await db
    .select({ recipe: recipeSchema })
    .from(recipeSubRecipeSchema)
    .where(eq(recipeSubRecipeSchema.parentId, recipeId))
    .leftJoin(recipeSchema, eq(recipeSubRecipeSchema.childId, recipeSchema.id))
  return recipes.map(row => row.recipe)
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

export default {
  addRecipe,
  getRecipes,
  getRecipe,
  getRecipeIngredients,
  addIngredient,
  addIngredientToRecipe,
  getIngredients,
  removeIngredientFromRecipe,
  addSubRecipeToRecipe,
  getRecipeSubRecipes,
  updateIngredient,
  updateRecipe,
}
