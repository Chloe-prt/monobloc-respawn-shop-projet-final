/*
  Warnings:

  - You are about to alter the column `code` on the `adress` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `adress` MODIFY `code` INTEGER NOT NULL;
