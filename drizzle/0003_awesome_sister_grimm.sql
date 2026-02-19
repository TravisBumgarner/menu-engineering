CREATE TABLE `recipe_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`category_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `recipe_categories` (`id`, `recipe_id`, `category_id`, `created_at`, `updated_at`)
SELECT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))),
       `id`, `category_id`, datetime('now'), datetime('now')
FROM `recipes` WHERE `category_id` IS NOT NULL;
--> statement-breakpoint
ALTER TABLE `recipes` DROP COLUMN `category_id`;
