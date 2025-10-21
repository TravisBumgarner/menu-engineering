import {
  IngredientDTO,
  NewIngredientDTO,
  NewRecipeDTO,
  RecipeDTO,
} from './types'

export const CHANNEL = {
  DB: {
    ADD_RECIPE: 'db:add-recipe',
    GET_RECIPES: 'db:get-recipes',
    GET_RECIPE: 'db:get-recipe',
    ADD_INGREDIENT: 'db:add-ingredient',
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
  [CHANNEL.DB.GET_RECIPES]: {
    args: undefined
    result: { recipes: Array<RecipeDTO> }
  }
  [CHANNEL.DB.GET_RECIPE]: {
    args: { id: string }
    result: { recipe: RecipeDTO | null; ingredients: Array<IngredientDTO> }
  }
  [CHANNEL.DB.ADD_INGREDIENT]: {
    args: { payload: NewIngredientDTO & { recipeId?: string } }
    result: { success: boolean }
  }
  [CHANNEL.DB.GET_INGREDIENTS]: {
    args: undefined
    result: { ingredients: Array<IngredientDTO> }
  }
}
