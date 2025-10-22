import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { RECIPE_STATUS } from '../../shared/recipe.types'
import { ALL_UNITS } from '../../shared/units.types'

export const recipeSchema = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  produces: real('produces').notNull(),
  units: text('units').notNull(),

  status: text('status', {
    enum: [
      RECIPE_STATUS.ARCHIVED,
      RECIPE_STATUS.DRAFT,
      RECIPE_STATUS.PUBLISHED,
    ],
  }).notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  notes: text('notes').notNull().default(''),
  showInMenu: integer('show_in_menu', { mode: 'boolean' }).notNull(),
})

export const ingredientSchema = sqliteTable('ingredients', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  cost: real('cost').notNull(),
  quantity: real('quantity').notNull(),
  units: text('units', {
    enum: Object.values({ ...ALL_UNITS }) as [string, ...string[]],
  }).notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  notes: text('notes').notNull().default(''),
})

export const recipeIngredientSchema = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  parentId: text('recipe_id').notNull(),
  childId: text('ingredient_id').notNull(),
})

export const recipeSubRecipeSchema = sqliteTable('recipe_sub_recipes', {
  id: text('id').primaryKey(),
  parentId: text('recipe_id').notNull(),
  childId: text('child_recipe_id').notNull(),
})
