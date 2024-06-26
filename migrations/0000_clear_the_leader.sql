CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(24) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `urls` (
	`slug` varchar(255) NOT NULL,
	`destination` varchar(2048) NOT NULL,
	`clicks` bigint unsigned DEFAULT 0,
	`user_id` varchar(24),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `urls_slug` PRIMARY KEY(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(24) NOT NULL,
	`discord_id` varchar(255) NOT NULL,
	`discord_username` varchar(255) NOT NULL,
	`is_allowed_custom_slugs` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `urls` ADD CONSTRAINT `urls_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `slug_idx` ON `urls` (`slug`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `urls` (`user_id`);