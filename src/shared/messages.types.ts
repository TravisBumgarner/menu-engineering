import {
  IngredientDTO,
  NewIngredientDTO,
  NewRecipeDTO,
  RecipeDTO,
} from './recipe.types'

export const CHANNEL = {
  DB: {
    ADD_INGREDIENT: 'db:add-ingredient',
    ADD_RECIPE: 'db:add-recipe',
    ADD_SUB_RECIPE: 'db:add-sub-recipe',
    UPDATE_RECIPE: 'db:update-recipe',
    UPDATE_INGREDIENT: 'db:update-ingredient',
    GET_INGREDIENTS: 'db:get-ingredients',
    GET_RECIPES: 'db:get-recipes',
    GET_RECIPE: 'db:get-recipe',
    ADD_EXISTING_TO_RECIPE: 'db:add-existing-to-recipe',
    REMOVE_INGREDIENT_FROM_RECIPE: 'db:remove-ingredient-from-recipe',
    DELETE_INGREDIENT: 'db:delete-ingredient',
    DELETE_RECIPE: 'db:delete-recipe',
  },
} as const

export type FromRenderer = {
  ['does-not-exist']: { id: number }
}

export type FromMain = {
  ['does-not-exist']: { ok: boolean; id: number }
}

export type Invokes = {
  [CHANNEL.DB.ADD_RECIPE]: {
    args: { payload: NewRecipeDTO }
    result: { recipeId: string | null }
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
  [CHANNEL.DB.ADD_EXISTING_TO_RECIPE]: {
    args: {
      childId: string
      parentId: string
      type: 'ingredient' | 'recipe'
    }
    result: { success: boolean }
  }
}
