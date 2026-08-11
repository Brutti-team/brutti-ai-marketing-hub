CREATE TABLE `content_calendar` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`time` text DEFAULT '' NOT NULL,
	`platform` text DEFAULT 'Facebook' NOT NULL,
	`content_type` text DEFAULT 'Facebook Post' NOT NULL,
	`product_name` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `marketing_content` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`platform` text DEFAULT 'Facebook' NOT NULL,
	`content_type` text DEFAULT 'Facebook Post' NOT NULL,
	`product_name` text DEFAULT '' NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'Review' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text
);
