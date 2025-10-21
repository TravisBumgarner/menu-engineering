import {
  IngredientDTO,
  NewIngredientDTO,
  NewRecipeDTO,
  RecipeDTO,
} from './types'

export const CHANNEL = {
  DB: {
    ADD_RECIPE: 'db:add-recipe',
    ADD_SUB_RECIPE: 'db:add-sub-recipe',
    UPDATE_RECIPE: 'db:update-recipe',
    DELETE_RECIPE: 'db:delete-recipe',
    GET_RECIPES: 'db:get-recipes',
    GET_RECIPE: 'db:get-recipe',
    ADD_INGREDIENT: 'db:add-ingredient',
    UPDATE_INGREDIENT: 'db:update-ingredient',
    REMOVE_INGREDIENT_FROM_RECIPE: 'db:remove-ingredient-from-recipe',
    DELETE_INGREDIENT: 'db:delete-ingredient',
    GET_INGREDIENTS: 'db:get-ingredients',
  },
} as const

export type FromRenderer = {
  // [CHANNEL.WEE_WOO]: { id: number };
}

export type FromMain = {
  // [CHANNEL.WEE_WOO]: { ok: boolean; id: number };
}

export type Invokes = {
  [CHANNEL.DB.ADD_RECIPE]: {
    args: { payload: NewRecipeDTO }
    result: { success: boolean }
  }
  [CHANNEL.DB.ADD_SUB_RECIPE]: {
    args: {
      payload: {
        newRecipe: NewRecipeDTO
        parentRecipeId: string
      }
    }
    result: { success: boolean }
  }
  [CHANNEL.DB.UPDATE_RECIPE]: {
    args: { id: string; payload: Partial<NewRecipeDTO> }
    result: { success: boolean }
  }
  [CHANNEL.DB.DELETE_RECIPE]: {
    args: { id: string }
    result: { success: boolean }
  }
  [CHANNEL.DB.GET_RECIPES]: {
    args: undefined
    result: { recipes: Array<RecipeDTO> }
  }
  [CHANNEL.DB.GET_RECIPE]: {
    args: { id: string }
    result: {
      recipe: RecipeDTO | null
      ingredients: Array<IngredientDTO>
      subRecipes: Array<RecipeDTO>
    }
  }
  [CHANNEL.DB.ADD_INGREDIENT]: {
    args: {
      payload: {
        newIngredient: NewIngredientDTO
        recipeId?: string
      }
    }
    result: { success: boolean }
  }
  [CHANNEL.DB.UPDATE_INGREDIENT]: {
    args: { id: string; payload: Partial<NewIngredientDTO> }
    result: { success: boolean }
  }
  [CHANNEL.DB.REMOVE_INGREDIENT_FROM_RECIPE]: {
    args: { ingredientId: string; recipeId: string }
    result: { success: boolean }
  }
  [CHANNEL.DB.DELETE_INGREDIENT]: {
    args: { id: string }
    result: { success: boolean }
  }
  [CHANNEL.DB.GET_INGREDIENTS]: {
    args: undefined
    result: { ingredients: Array<IngredientDTO> }
  }
}
