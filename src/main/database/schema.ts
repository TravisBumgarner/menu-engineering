import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RECIPE_STATUS } from "../../shared/types";

export const recipe = sqliteTable("recipes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  produces: real("produces").notNull(),
  units: text("units").notNull(),
  status: text("status", {
    enum: [
      RECIPE_STATUS.ARCHIVED,
      RECIPE_STATUS.DRAFT,
      RECIPE_STATUS.PUBLISHED,
    ],
  }).notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  notes: text("notes").notNull().default(""),
  showInMenu: integer("show_in_menu", { mode: "boolean" }).notNull(),
});

export const ingredient = sqliteTable("ingredients", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  quantity: real("quantity").notNull(),
  units: text("units").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  notes: text("notes").notNull().default(""),
});

export const recipeIngredient = sqliteTable("recipe_ingredients", {
  id: text("id").primaryKey(),
  parentId: text("recipe_id").notNull(),
  childId: text("ingredient_id").notNull(),
});
