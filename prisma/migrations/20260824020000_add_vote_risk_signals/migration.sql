ALTER TABLE `voterecord` ADD COLUMN `ipHash` VARCHAR(191) NULL;
ALTER TABLE `voterecord` ADD COLUMN `deviceHash` VARCHAR(191) NULL;
ALTER TABLE `voterecord` ADD COLUMN `riskScore` INT NOT NULL DEFAULT 0;
ALTER TABLE `voterecord` ADD COLUMN `riskReason` TEXT NULL;
CREATE INDEX `voterecord_ipHash_idx` ON `voterecord` (`ipHash`);
CREATE INDEX `voterecord_deviceHash_idx` ON `voterecord` (`deviceHash`);
CREATE INDEX `voterecord_voteTime_idx` ON `voterecord` (`voteTime`);
