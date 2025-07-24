/*
  Warnings:

  - You are about to alter the column `note` on the `advice` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `text` to the `Advice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `advice` ADD COLUMN `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `text` VARCHAR(191) NOT NULL,
    MODIFY `note` INTEGER NOT NULL;
