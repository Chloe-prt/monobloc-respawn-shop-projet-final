/*
  Warnings:

  - You are about to drop the column `userId` on the `adress` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `adress` DROP FOREIGN KEY `Adress_userId_fkey`;

-- DropIndex
DROP INDEX `Adress_userId_key` ON `adress`;

-- AlterTable
ALTER TABLE `adress` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `adressId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_adressId_fkey` FOREIGN KEY (`adressId`) REFERENCES `Adress`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
