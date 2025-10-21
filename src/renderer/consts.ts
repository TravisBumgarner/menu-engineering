export const ROUTES = {
  recipes: {
    href: () => '/',
    label: 'Recipes',
    target: '_self',
  },
  recipe: {
    href: (id?: string) => (id ? `/recipe/${id}` : '/recipe/:id'),
    label: 'Recipe',
    target: '_self',
  },
  ingredients: {
    href: () => '/ingredients',
    label: 'Ingredients',
    target: '_self',
  },
} as const

export const QUERY_KEYS = {
  RECIPES: 'recipes',
  RECIPE: 'recipe',
  INGREDIENTS: 'ingredients',
}
