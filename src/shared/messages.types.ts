import type { ErrorCode } from './errorCodes'
import type {
  IngredientDTO,
  NewIngredientDTO,
  NewIngredientInRecipeDTO,
  NewRecipeDTO,
  NewSubRecipeInRecipeDTO,
  RecipeDTO,
  RelationDTO,
} from './recipe.types'
import type { AllUnits } from './units.types'

export const CHANNEL = {
  DB: {
    ADD_INGREDIENT: 'db:add-ingredient',
    ADD_RECIPE: 'db:add-recipe',
    ADD_SUB_RECIPE: 'db:add-sub-recipe',
    UPDATE_RECIPE: 'db:update-recipe',
    UPDATE_INGREDIENT: 'db:update-ingredient',
    GET_INGREDIENT: 'db:get-ingredient',
    GET_INGREDIENTS: 'db:get-ingredients',
    GET_RECIPES: 'db:get-recipes',
    GET_RECIPE: 'db:get-recipe',
    ADD_EXISTING_TO_RECIPE: 'db:add-existing-to-recipe',
    UPDATE_RECIPE_RELATION: 'db:update-recipe-relation',
    REMOVE_INGREDIENT_FROM_RECIPE: 'db:remove-ingredient-from-recipe',
    REMOVE_SUB_RECIPE_FROM_RECIPE: 'db:remove-sub-recipe-from-recipe',
    DELETE_INGREDIENT: 'db:delete-ingredient',
    DELETE_RECIPE: 'db:delete-recipe',
  },
  APP: {
    GET_BACKUP_DIRECTORY: 'app:get-backup-directory',
    EXPORT_ALL_DATA: 'app:export-all-data',
    RESTORE_ALL_DATA: 'app:restore-all-data',
    NUKE_DATABASE: 'app:nuke-database',
  },
  FILES: {
    GET_PHOTO: 'files:get-photo',
    EXPORT_RECIPES_PDF: 'files:export-recipes-pdf',
  },
} as const

export type FromRenderer = {
  'does-not-exist': { id: number }
}

export type FromMain = {
  'does-not-exist': { ok: boolean; id: number }
}

export type Invokes = {
  [CHANNEL.DB.ADD_RECIPE]: {
    args: { payload: NewRecipeDTO & NewPhotoUploadDTO }
    result: { recipeId: string; success: true } | { success: false; errorCode: ErrorCode }
  }
  [CHANNEL.DB.ADD_SUB_RECIPE]: {
    args: {
      payload: {
        newRecipe: NewRecipeDTO & NewPhotoUploadDTO
        parentRecipeId: string
        units: AllUnits
      }
    }
    result: { success: true } | { success: false; errorCode: ErrorCode }
  }
  [CHANNEL.DB.UPDATE_RECIPE]: {
    args: { id: string; payload: Partial<NewRecipeDTO & NewPhotoUploadDTO> }
    result: { success: boolean; affectedRecipeCount: number }
  }
  [CHANNEL.DB.DELETE_RECIPE]: {
    args: { id: string }
    result: { success: boolean }
  }
  [CHANNEL.DB.GET_RECIPES]: {
    args: undefined
    result: { recipes: Array<RecipeDTO & { usedInRecipesCount: number }> }
  }
  [CHANNEL.DB.GET_RECIPE]: {
    args: { id: string }
    result: {
      recipe: RecipeDTO | null
      ingredients: Array<IngredientDTO & { relation: RelationDTO }>
      subRecipes: Array<RecipeDTO & { relation: RelationDTO }>
      usedInRecipes: Array<RecipeDTO & { relationQuantity: number; relationUnits: AllUnits }>
    }
  }
  [CHANNEL.DB.ADD_INGREDIENT]: {
    args: {
      payload: {
        newIngredient: NewIngredientDTO
        attachToRecipe?: {
          recipeId: string
          recipeQuantity: number
        }
        units: AllUnits
      }
    }
    result: { success: true; ingredientId: string } | { success: false; errorCode: ErrorCode }
  }
  [CHANNEL.DB.UPDATE_INGREDIENT]: {
    args: { id: string; payload: Partial<NewIngredientDTO> }
    result: { success: boolean; wasConverted: boolean; affectedRecipeCount: number }
  }
  [CHANNEL.DB.REMOVE_INGREDIENT_FROM_RECIPE]: {
    args: { ingredientId: string; recipeId: string }
    result: { success: boolean }
  }
  [CHANNEL.DB.REMOVE_SUB_RECIPE_FROM_RECIPE]: {
    args: { subRecipeId: string; recipeId: string }
    result: { success: boolean }
  }
  [CHANNEL.DB.DELETE_INGREDIENT]: {
    args: { id: string }
    result: { success: boolean }
  }
  [CHANNEL.DB.GET_INGREDIENT]: {
    args: { id: string }
    result: {
      ingredient: IngredientDTO | null
      usedInRecipes: Array<RecipeDTO & { relationQuantity: number; relationUnits: AllUnits }>
    }
  }
  [CHANNEL.DB.GET_INGREDIENTS]: {
    args: undefined
    result: { ingredients: Array<IngredientDTO & { recipeCount: number }> }
  }
  [CHANNEL.DB.ADD_EXISTING_TO_RECIPE]: {
    args: (NewIngredientInRecipeDTO & { type: 'ingredient' }) | (NewSubRecipeInRecipeDTO & { type: 'sub-recipe' })
    result: { success: boolean }
  }
  [CHANNEL.DB.UPDATE_RECIPE_RELATION]: {
    args: {
      parentId: string
      childId: string
      type: 'ingredient' | 'sub-recipe'
      quantity?: number
      units?: AllUnits
    }
    result: { success: boolean }
  }
  [CHANNEL.APP.GET_BACKUP_DIRECTORY]: {
    args: undefined
    result: { backupDirectory: string }
  }
  [CHANNEL.APP.EXPORT_ALL_DATA]: {
    args: undefined
    result: {
      success: boolean
      data?: string // base64 encoded ZIP data
      error?: string
    }
  }
  [CHANNEL.APP.RESTORE_ALL_DATA]: {
    args: {
      data:
        | string
        | {
            ingredients: Array<IngredientDTO>
            recipes: Array<RecipeDTO>
            relations: Array<
              RelationDTO & {
                parentId: string
                childId: string
                type: 'ingredient' | 'sub-recipe'
              }
            >
          }
    }
    result: { success: boolean; error?: string }
  }
  [CHANNEL.APP.NUKE_DATABASE]: {
    args: undefined
    result: { success: boolean; error?: string }
  }
  [CHANNEL.FILES.GET_PHOTO]: {
    args: { fileName: string }
    result: { data: Uint8Array | null }
  }
  [CHANNEL.FILES.EXPORT_RECIPES_PDF]: {
    args: {
      pdfs: Array<{
        filename: string
        data: Uint8Array
      }>
      oneFilePerRecipe: boolean
    }
    result: { success: boolean; error?: string; savedPaths?: string[] }
  }
}

export type NewPhotoUploadDTO = { photo?: { bytes: Uint8Array; extension: string } }
