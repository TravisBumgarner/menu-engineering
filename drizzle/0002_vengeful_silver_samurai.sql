PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`quantity` real NOT NULL,
	`units` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_ingredients`("id", "title", "quantity", "units", "created_at", "updated_at", "notes") SELECT "id", "title", "quantity", "units", "created_at", "updated_at", "notes" FROM `ingredients`;--> statement-breakpoint
DROP TABLE `ingredients`;--> statement-breakpoint
ALTER TABLE `__new_ingredients` RENAME TO `ingredients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_recipes` (
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
INSERT INTO `__new_recipes`("id", "title", "produces", "units", "status", "created_at", "updated_at", "notes", "show_in_menu") SELECT "id", "title", "produces", "units", "status", "created_at", "updated_at", "notes", "show_in_menu" FROM `recipes`;--> statement-breakpoint
DROP TABLE `recipes`;--> statement-breakpoint
ALTER TABLE `__new_recipes` RENAME TO `recipes`;