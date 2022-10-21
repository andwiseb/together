-- CreateTable
CREATE TABLE `RoomInfo` (
    `roomId` VARCHAR(191) NOT NULL,
    `isOpened` BOOLEAN NOT NULL DEFAULT true,
    `currTime` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoomInfo_roomId_key`(`roomId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomInfo` ADD CONSTRAINT `RoomInfo_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
