import { eq } from 'drizzle-orm'
import { NewIngredientDTO, NewRecipeDTO } from 'src/shared/types'
import { v4 as uuidv4 } from 'uuid'
import { db } from './client'
import {
  ingredientSchema,
  recipeIngredientSchema,
  recipeSchema,
} from './schema'

const addRecipe = async (recipeData: NewRecipeDTO) => {
  // generate an id required by the schema, then insert
  const newId = uuidv4()

  const inserted = await db
    .insert(recipeSchema)
    .values({ id: newId, ...recipeData })
    .run()

  return inserted
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

export default {
  addRecipe,
  getRecipes,
  getRecipe,
  getRecipeIngredients,
  addIngredient,
  addIngredientToRecipe,
  getIngredients,
}
