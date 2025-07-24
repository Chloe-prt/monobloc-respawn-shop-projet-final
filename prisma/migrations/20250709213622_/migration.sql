/*
  Warnings:

  - You are about to drop the column `userAdviceId` on the `advice` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `advice` table. All the data in the column will be lost.
  - Added the required column `receiverId` to the `Advice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Advice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `advice` DROP FOREIGN KEY `Advice_userAdviceId_fkey`;

-- DropForeignKey
ALTER TABLE `advice` DROP FOREIGN KEY `Advice_userId_fkey`;

-- DropIndex
DROP INDEX `Advice_userAdviceId_fkey` ON `advice`;

-- DropIndex
DROP INDEX `Advice_userId_fkey` ON `advice`;

-- AlterTable
ALTER TABLE `advice` DROP COLUMN `userAdviceId`,
    DROP COLUMN `userId`,
    ADD COLUMN `receiverId` INTEGER NOT NULL,
    ADD COLUMN `senderId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Advice` ADD CONSTRAINT `Advice_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Advice` ADD CONSTRAINT `Advice_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
