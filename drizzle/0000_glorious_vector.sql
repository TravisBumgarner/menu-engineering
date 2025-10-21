CREATE TABLE `ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`quantity` real NOT NULL,
	`units` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`ingredient_id` text NOT NULL
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
