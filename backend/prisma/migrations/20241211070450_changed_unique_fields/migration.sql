/*
  Warnings:

  - A unique constraint covering the columns `[email,isArchived]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `drivers_email_key` ON `drivers`;

-- DropIndex
DROP INDEX `users_email_key` ON `users`;

-- CreateIndex
CREATE UNIQUE INDEX `drivers_email_isArchived_key` ON `drivers`(`email`, `isArchived`);
