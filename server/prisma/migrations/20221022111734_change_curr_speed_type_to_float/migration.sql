/*
  Warnings:

  - You are about to alter the column `currSpeed` on the `roominfo` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `roominfo` MODIFY `currSpeed` DOUBLE NOT NULL DEFAULT 1;
