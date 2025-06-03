/*
  Warnings:

  - You are about to drop the column `support` on the `products` table. All the data in the column will be lost.
  - Added the required column `description` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `support`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NOT NULL;
