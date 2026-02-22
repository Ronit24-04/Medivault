import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import cloudinary from '../../config/cloudinary';

interface UploadRecordData {
    recordType: string;
    title: string;
    description?: string;
    recordDate: string;
    doctorName?: string;
    hospitalName?: string;
    medicalCondition?: string;
    isCritical?: boolean;
    tags?: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
    thumbnailUrl?: string;
}

interface GetRecordsFilters {
    recordType?: string;
    startDate?: string;
    endDate?: string;
    doctorName?: string;
    hospitalName?: string;
    medicalCondition?: string;
    isCritical?: string;
    search?: string;
}

export class RecordsService {
    async verifyPatientOwnership(adminId: number, patientId: number) {
        const patient = await prisma.patient.findFirst({
            where: {
                patient_id: patientId,
                admin_id: adminId,
            },
        });

        if (!patient) {
            throw new AppError(404, 'Patient not found or access denied');
        }

        return patient;
    }

    async uploadRecord(adminId: number, patientId: number, data: UploadRecordData) {
        // Verify ownership
        await this.verifyPatientOwnership(adminId, patientId);

        const record = await prisma.medicalRecord.create({
            data: {
                patient_id: patientId,
                category: data.recordType,
                title: data.title,
                description: data.description,
                record_date: new Date(data.recordDate),
                physician_name: data.doctorName,
                facility_name: data.hospitalName,
                file_path: data.fileUrl,
                file_type: data.fileType,
                file_size_bytes: data.fileSize,
                is_critical: data.isCritical || false,
            },
        });

        return record;
    }

    async getRecords(adminId: number, patientId: number, filters: GetRecordsFilters) {
        // Verify ownership
        await this.verifyPatientOwnership(adminId, patientId);

        const where: any = { patient_id: patientId };

        if (filters.recordType) {
            where.record_type = filters.recordType;
        }

        if (filters.startDate || filters.endDate) {
            where.record_date = {};
            if (filters.startDate) {
                where.record_date.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.record_date.lte = new Date(filters.endDate);
            }
        }

        if (filters.doctorName) {
            where.doctor_name = { contains: filters.doctorName };
        }

        if (filters.hospitalName) {
            where.hospital_name = { contains: filters.hospitalName };
        }

        if (filters.medicalCondition) {
            where.medical_condition = { contains: filters.medicalCondition };
        }

        if (filters.isCritical) {
            where.is_critical = filters.isCritical === 'true';
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search } },
                { description: { contains: filters.search } },
                { doctor_name: { contains: filters.search } },
                { hospital_name: { contains: filters.search } },
            ];
        }

        const records = await prisma.medicalRecord.findMany({
            where,
            orderBy: { record_date: 'desc' },
        });

        return records;
    }

    async getRecordById(adminId: number, patientId: number, recordId: number) {
        // Verify ownership
        await this.verifyPatientOwnership(adminId, patientId);

        const record = await prisma.medicalRecord.findFirst({
            where: {
                record_id: recordId,
                patient_id: patientId,
            },
        });

        if (!record) {
            throw new AppError(404, 'Record not found');
        }

        return record;
    }

    async updateRecord(adminId: number, patientId: number, recordId: number, data: Partial<UploadRecordData>) {
        // Verify ownership
        await this.verifyPatientOwnership(adminId, patientId);

        const existingRecord = await prisma.medicalRecord.findFirst({
            where: {
                record_id: recordId,
                patient_id: patientId,
            },
        });

        if (!existingRecord) {
            throw new AppError(404, 'Record not found');
        }

        const record = await prisma.medicalRecord.update({
            where: { record_id: recordId },
            data: {
                category: data.recordType,
                title: data.title,
                description: data.description,
                record_date: data.recordDate ? new Date(data.recordDate) : undefined,
                physician_name: data.doctorName,
                facility_name: data.hospitalName,
                is_critical: data.isCritical,
            },
        });

        return record;
    }

    async deleteRecord(adminId: number, patientId: number, recordId: number) {
        // Verify ownership
        await this.verifyPatientOwnership(adminId, patientId);

        const record = await prisma.medicalRecord.findFirst({
            where: {
                record_id: recordId,
                patient_id: patientId,
            },
        });

        if (!record) {
            throw new AppError(404, 'Record not found');
        }

        // Delete from Cloudinary before removing the DB row
        if (record.file_path) {
            try {
                const publicId = this.extractCloudinaryPublicId(record.file_path);
                const resourceType = record.file_type?.startsWith('image/') ? 'image' : 'raw';
                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            } catch (cloudinaryError) {
                // Log but don't block deletion – the DB row should still be removed
                console.error('Failed to delete file from Cloudinary:', cloudinaryError);
            }
        }

        await prisma.medicalRecord.delete({
            where: { record_id: recordId },
        });

        return { message: 'Record deleted successfully' };
    }

    /**
     * Extracts the Cloudinary public_id from a full Cloudinary URL.
     * Example URL:
     *   https://res.cloudinary.com/<cloud>/image/upload/v1234567890/medivault/medical-records/abc123.pdf
     * Extracted public_id:
     *   medivault/medical-records/abc123
     */
    private extractCloudinaryPublicId(fileUrl: string): string {
        // Split on "/upload/" and take everything after it
        const uploadIndex = fileUrl.indexOf('/upload/');
        if (uploadIndex === -1) {
            throw new Error(`Unable to extract public_id from Cloudinary URL: ${fileUrl}`);
        }

        let afterUpload = fileUrl.substring(uploadIndex + '/upload/'.length);

        // Strip the optional version segment (e.g. "v1234567890/")
        afterUpload = afterUpload.replace(/^v\d+\//, '');

        // Strip the file extension
        const dotIndex = afterUpload.lastIndexOf('.');
        if (dotIndex !== -1) {
            afterUpload = afterUpload.substring(0, dotIndex);
        }

        return afterUpload;
    }

    async getTimeline(adminId: number, patientId: number) {
        // Verify ownership
        await this.verifyPatientOwnership(adminId, patientId);

        const records = await prisma.medicalRecord.findMany({
            where: { patient_id: patientId },
            orderBy: { record_date: 'desc' },
            select: {
                record_id: true,
                category: true,
                title: true,
                record_date: true,
                physician_name: true,
                facility_name: true,
                is_critical: true,
            },
        });

        return records;
    }
}

export const recordsService = new RecordsService();
