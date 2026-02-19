import type { AllUnits } from './units.types'

export const RECIPE_STATUS = {
  draft: 'draft',
  published: 'published',
  archived: 'archived',
} as const

export type RecipeStatus = keyof typeof RECIPE_STATUS

export type NewCategoryDTO = {
  title: string
}

export type CategoryDTO = NewCategoryDTO & {
  id: string
  createdAt: string
  updatedAt: string
}

export type NewRecipeDTO = {
  title: string
  produces: number
  units: AllUnits
  status: RecipeStatus
  showInMenu: boolean
  categoryIds?: string[]
}

export type RecipeDTO = NewRecipeDTO & {
  id: string
  createdAt: string
  updatedAt: string
  cost: number
  photoSrc?: string
}

export type NewIngredientDTO = {
  title: string
  units: AllUnits
  unitCost: number
}

export type RelationDTO = {
  quantity: number
  units: AllUnits
}

export type IngredientDTO = NewIngredientDTO & {
  id: string
  createdAt: string
  updatedAt: string
}

export type NewSubRecipeInRecipeDTO = {
  parentId: string
  childId: string
  units: AllUnits
}

export type SubRecipeInRecipeDTO = NewSubRecipeInRecipeDTO & {
  id: string
  createdAt: string
  updatedAt: string
  quantity: number
}

export type NewIngredientInRecipeDTO = {
  parentId: string
  childId: string
  units: AllUnits
  quantity: number
}

export type IngredientInRecipeDTO = NewIngredientInRecipeDTO & {
  id: string
  createdAt: string
  updatedAt: string
}
