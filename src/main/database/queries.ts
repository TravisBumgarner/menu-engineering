import { NewRecipeDTO } from "src/shared/types";
import { v4 as uuidv4 } from "uuid";
import { db } from "./client";
import { recipe } from "./schema";

const addRecipe = async (recipeData: NewRecipeDTO) => {
  // generate an id required by the schema, then insert
  const newId = uuidv4();

  const inserted = await db
    .insert(recipe)
    .values({ id: newId, ...recipeData })
    .run();

  return inserted;
};

const getRecipes = async () => {
  const recipes = await db.select().from(recipe).all();
  return recipes;
};

export default { addRecipe, getRecipes };
