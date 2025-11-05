CREATE TABLE `ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`unitCost` real NOT NULL,
	`units` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`ingredient_id` text NOT NULL,
	`quantity` real DEFAULT 0,
	`units` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`produces` real NOT NULL,
	`units` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`show_in_menu` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe_sub_recipes` (
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`child_recipe_id` text NOT NULL,
	`quantity` real DEFAULT 0,
	`units` text NOT NULL
);
