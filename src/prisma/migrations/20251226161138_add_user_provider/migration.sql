-- AlterTable
ALTER TABLE `user` ADD COLUMN `provider` VARCHAR(191) NOT NULL DEFAULT 'local',
    ADD COLUMN `providerUserId` VARCHAR(191) NULL;
