/*
  Warnings:

  - A unique constraint covering the columns `[street,city,code,departement,region]` on the table `Adress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Adress_street_city_code_departement_region_key` ON `Adress`(`street`, `city`, `code`, `departement`, `region`);
