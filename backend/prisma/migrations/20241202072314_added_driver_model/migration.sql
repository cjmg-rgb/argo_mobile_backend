/*
  Warnings:

  - You are about to drop the column `credit` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `accessType` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `credit` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[driverId]` on the table `cars` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `driverId` to the `cars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_name_idx` ON `users`;

-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `editAttemps` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `cars` ADD COLUMN `driverId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `departments` DROP COLUMN `credit`,
    ADD COLUMN `credits` INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `accessType`,
    DROP COLUMN `credit`,
    ADD COLUMN `credits` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `role` ENUM('user', 'admin') NOT NULL;

-- CreateTable
CREATE TABLE `drivers` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `drivers_email_key`(`email`),
    INDEX `drivers_email_name_idx`(`email`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `cars_driverId_key` ON `cars`(`driverId`);

-- CreateIndex
CREATE INDEX `users_name_email_idx` ON `users`(`name`, `email`);

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `cars_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
