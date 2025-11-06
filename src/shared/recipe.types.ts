import { AllUnits } from './units.types'

export const RECIPE_STATUS = {
  draft: 'draft',
  published: 'published',
  archived: 'archived',
} as const

export type RecipeStatus = keyof typeof RECIPE_STATUS

export type NewRecipeDTO = {
  title: string
  produces: number
  units: AllUnits
  status: RecipeStatus
  notes: string
  showInMenu: boolean
}

export type RecipeDTO = NewRecipeDTO & {
  id: string
  createdAt: string
  updatedAt: string
}

export type NewIngredientDTO = {
  title: string
  units: AllUnits
  notes: string
  unitCost: number
}

export type RelationDTO = {
  quantity: number
  units: AllUnits
}

// export type UsedInDTO = {
//   usedIn: RecipeDTO[]
// }

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
}

export type NewIngredientInRecipeDTO = {
  parentId: string
  childId: string
  units: AllUnits
}

export type IngredientInRecipeDTO = NewIngredientInRecipeDTO & {
  id: string
  createdAt: string
  updatedAt: string
}
