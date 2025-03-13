/*
  Warnings:

  - You are about to drop the column `driverName` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the column `driverPhoneNumber` on the `cars` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,isArchived]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `cars` DROP FOREIGN KEY `cars_driverId_fkey`;

-- AlterTable
ALTER TABLE `cars` DROP COLUMN `driverName`,
    DROP COLUMN `driverPhoneNumber`,
    MODIFY `driverId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_email_isArchived_key` ON `users`(`email`, `isArchived`);

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `cars_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
