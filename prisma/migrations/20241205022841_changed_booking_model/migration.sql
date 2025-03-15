/*
  Warnings:

  - You are about to drop the column `editAttemps` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `bookings` DROP COLUMN `editAttemps`,
    ADD COLUMN `editAttempts` INTEGER NOT NULL DEFAULT 0;
