import { t } from 'i18next'

export const ROUTES = {
  recipes: {
    href: () => '/',
    label: 'Recipes',
    target: '_self',
  },
  ingredients: {
    href: () => '/ingredients',
    label: t('ingredients'),
    target: '_self',
  },
  recipeDetail: {
    href: (id: string) => `/recipe/${id}`,
  },
} as const

export const QUERY_KEYS = {
  RECIPES: 'recipes',
  RECIPE: 'recipe',
  INGREDIENTS: 'ingredients',
  INGREDIENT: 'ingredient',
  AUTOCOMPLETE: 'autocomplete',
  PHOTO: 'photo',
}

export const PAGINATION = {
  DEFAULT_ROWS_PER_PAGE: 10 as number,
  ROWS_PER_PAGE_OPTIONS: [10, 25, 50, 100] as readonly number[],
} as const
