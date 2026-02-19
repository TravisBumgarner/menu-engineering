CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`category_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
