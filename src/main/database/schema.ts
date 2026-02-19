import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { RECIPE_STATUS } from '../../shared/recipe.types'
import { ALL_UNITS, type AllUnits } from '../../shared/units.types'

export const categorySchema = sqliteTable('categories', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const recipeSchema = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  produces: real('produces').notNull(),
  photoSrc: text('photo_src'),
  units: text('units', {
    enum: Object.values(ALL_UNITS) as [AllUnits, ...AllUnits[]],
  }).notNull(),

  status: text('status', {
    enum: [RECIPE_STATUS.archived, RECIPE_STATUS.draft, RECIPE_STATUS.published],
  }).notNull(),
  categoryId: text('category_id'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  showInMenu: integer('show_in_menu', { mode: 'boolean' }).notNull(),
})

export const ingredientSchema = sqliteTable('ingredients', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  unitCost: real('unitCost').notNull(),
  units: text('units', {
    enum: Object.values(ALL_UNITS) as [AllUnits, ...AllUnits[]],
  }).notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const recipeIngredientSchema = sqliteTable('recipe_ingredients', {
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  id: text('id').primaryKey(),
  parentId: text('recipe_id').notNull(),
  childId: text('ingredient_id').notNull(),
  quantity: real('quantity').default(0),
  units: text('units', {
    enum: Object.values(ALL_UNITS) as [AllUnits, ...AllUnits[]],
  }).notNull(),
})

export const recipeSubRecipeSchema = sqliteTable('recipe_sub_recipes', {
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  id: text('id').primaryKey(),
  parentId: text('recipe_id').notNull(),
  childId: text('child_recipe_id').notNull(),
  quantity: real('quantity').default(0),
  units: text('units', {
    enum: Object.values(ALL_UNITS) as [AllUnits, ...AllUnits[]],
  }).notNull(),
})
