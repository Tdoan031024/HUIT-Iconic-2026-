CREATE TABLE `passwordresetcode` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `codeHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `passwordresetcode_userId_expiresAt_idx` (`userId`, `expiresAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `apierrorlog` (
  `id` VARCHAR(191) NOT NULL,
  `method` VARCHAR(191) NOT NULL,
  `path` VARCHAR(191) NOT NULL,
  `statusCode` INTEGER NOT NULL,
  `message` TEXT NOT NULL,
  `stack` TEXT NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `apierrorlog_createdAt_idx` (`createdAt`),
  INDEX `apierrorlog_statusCode_idx` (`statusCode`),
  INDEX `apierrorlog_path_idx` (`path`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
