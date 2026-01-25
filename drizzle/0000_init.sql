CREATE TABLE `account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bank` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text NOT NULL,
	`icon` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `category_rule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pattern` text NOT NULL,
	`subCategoryId` text,
	`positiveAmount` integer NOT NULL,
	`transferSourceAccountId` integer,
	`transferDestinationAccountId` integer,
	FOREIGN KEY (`subCategoryId`) REFERENCES `sub_category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transferSourceAccountId`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transferDestinationAccountId`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `file` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sub_category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`icon` text NOT NULL,
	`categoryId` text NOT NULL,
	FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`accountId` integer NOT NULL,
	`fileId` integer NOT NULL,
	`date` text NOT NULL,
	`amount` numeric NOT NULL,
	`currency` text NOT NULL,
	`description` text NOT NULL,
	`subCategoryId` text,
	`predictedBalance` numeric,
	`withCategoryRule` integer,
	`transferSourceAccountId` integer,
	`transferDestinationAccountId` integer,
	FOREIGN KEY (`accountId`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fileId`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subCategoryId`) REFERENCES `sub_category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`withCategoryRule`) REFERENCES `category_rule`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transferSourceAccountId`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transferDestinationAccountId`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action
);
