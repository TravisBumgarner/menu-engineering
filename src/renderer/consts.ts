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
  unitConversions: {
    href: () => '/unit-conversions',
    label: t('unitConversions'),
    target: '_self',
  },
} as const

export const QUERY_KEYS = {
  RECIPE_COST: 'recipe_cost',
  RECIPES: 'recipes',
  RECIPE: 'recipe',
  INGREDIENTS: 'ingredients',
  AUTOCOMPLETE: 'autocomplete',
}

export const ROWS_PER_PAGE = 5
