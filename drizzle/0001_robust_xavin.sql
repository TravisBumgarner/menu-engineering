CREATE TABLE `recipe_sub_recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`child_recipe_id` text NOT NULL
);
