-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `credit` INTEGER NOT NULL DEFAULT 50,
    `departmentId` VARCHAR(191) NOT NULL,
    `accessType` ENUM('user', 'admin', 'driver') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `credit` INTEGER NOT NULL DEFAULT 50,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,

    INDEX `departments_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colorTags` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cars` (
    `id` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `plateNumber` VARCHAR(191) NOT NULL,
    `driverName` VARCHAR(191) NOT NULL,
    `driverPhoneNumber` VARCHAR(191) NOT NULL,
    `codingDay` INTEGER NOT NULL,
    `colorTagId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `cars_colorTagId_key`(`colorTagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `pickUpTime` DATETIME(3) NOT NULL,
    `dropOffTime` DATETIME(3) NOT NULL,
    `instruction` VARCHAR(191) NOT NULL,
    `creditDeduction` INTEGER NOT NULL,
    `carId` VARCHAR(191) NOT NULL,
    `bookedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,

    INDEX `bookings_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `cars_colorTagId_fkey` FOREIGN KEY (`colorTagId`) REFERENCES `colorTags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `cars`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_bookedById_fkey` FOREIGN KEY (`bookedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
