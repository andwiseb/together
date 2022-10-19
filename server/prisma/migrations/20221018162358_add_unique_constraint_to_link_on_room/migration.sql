/*
  Warnings:

  - A unique constraint covering the columns `[link]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Room_link_key` ON `Room`(`link`);
