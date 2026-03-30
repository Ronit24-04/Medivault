-- CreateTable
CREATE TABLE `shared_access` (
    `share_id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `hospital_id` INTEGER NULL,
    `contact_id` INTEGER NULL,
    `provider_name` VARCHAR(200) NOT NULL,
    `provider_type` VARCHAR(20) NOT NULL,
    `access_level` VARCHAR(100) NOT NULL,
    `shared_on` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expires_on` TIMESTAMP(0) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `records_accessed_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),

    INDEX `shared_access_patient_id_idx`(`patient_id`),
    INDEX `shared_access_hospital_id_idx`(`hospital_id`),
    INDEX `shared_access_contact_id_idx`(`contact_id`),
    INDEX `shared_access_status_idx`(`status`),
    INDEX `shared_access_expires_on_idx`(`expires_on`),
    PRIMARY KEY (`share_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shared_access` ADD CONSTRAINT `shared_access_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shared_access` ADD CONSTRAINT `shared_access_hospital_id_fkey` FOREIGN KEY (`hospital_id`) REFERENCES `hospital`(`hospital_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shared_access` ADD CONSTRAINT `shared_access_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `emergency_contact`(`contact_id`) ON DELETE SET NULL ON UPDATE CASCADE;
