import { eq } from 'drizzle-orm'
import { NewRecipeDTO } from 'src/shared/types'
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

export default { addRecipe, getRecipes, getRecipe, getRecipeIngredients }
