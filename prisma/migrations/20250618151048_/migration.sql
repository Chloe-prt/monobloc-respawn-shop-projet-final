/*
  Warnings:

  - You are about to drop the column `land` on the `adress` table. All the data in the column will be lost.
  - Added the required column `region` to the `Adress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `adress` DROP COLUMN `land`,
    ADD COLUMN `region` VARCHAR(191) NOT NULL;
