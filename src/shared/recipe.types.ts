export const RECIPE_STATUS = {
  draft: 'draft',
  published: 'published',
  archived: 'archived',
} as const

export type RecipeStatus = keyof typeof RECIPE_STATUS

export type NewRecipeDTO = {
  title: string
  produces: number
  units: string
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
  quantity: number
  units: string
  notes: string
  cost: number
}
export type IngredientDTO = NewIngredientDTO & {
  id: string
  createdAt: string
  updatedAt: string
}
