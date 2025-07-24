/*
  Warnings:

  - You are about to drop the column `conversationId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the `article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `receiverId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `article` DROP FOREIGN KEY `Article_userId_fkey`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_articleId_fkey`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `conversation` DROP FOREIGN KEY `Conversation_user1Id_fkey`;

-- DropForeignKey
ALTER TABLE `conversation` DROP FOREIGN KEY `Conversation_user2Id_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_conversationId_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_userId_fkey`;

-- DropIndex
DROP INDEX `Message_conversationId_fkey` ON `message`;

-- DropIndex
DROP INDEX `Message_userId_fkey` ON `message`;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `conversationId`,
    DROP COLUMN `photo`,
    DROP COLUMN `userId`,
    ADD COLUMN `receiverId` INTEGER NOT NULL,
    ADD COLUMN `senderId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `article`;

-- DropTable
DROP TABLE `comment`;

-- DropTable
DROP TABLE `conversation`;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
