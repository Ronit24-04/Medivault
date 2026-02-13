import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

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
                record_type: data.recordType,
                title: data.title,
                description: data.description,
                record_date: new Date(data.recordDate),
                doctor_name: data.doctorName,
                hospital_name: data.hospitalName,
                medical_condition: data.medicalCondition,
                file_url: data.fileUrl,
                file_type: data.fileType,
                file_size: data.fileSize,
                thumbnail_url: data.thumbnailUrl,
                is_critical: data.isCritical || false,
                tags: data.tags,
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
                record_type: data.recordType,
                title: data.title,
                description: data.description,
                record_date: data.recordDate ? new Date(data.recordDate) : undefined,
                doctor_name: data.doctorName,
                hospital_name: data.hospitalName,
                medical_condition: data.medicalCondition,
                is_critical: data.isCritical,
                tags: data.tags,
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

        await prisma.medicalRecord.delete({
            where: { record_id: recordId },
        });

        return { message: 'Record deleted successfully' };
    }

    async getTimeline(adminId: number, patientId: number) {
        // Verify ownership
        await this.verifyPatientOwnership(adminId, patientId);

        const records = await prisma.medicalRecord.findMany({
            where: { patient_id: patientId },
            orderBy: { record_date: 'desc' },
            select: {
                record_id: true,
                record_type: true,
                title: true,
                record_date: true,
                doctor_name: true,
                hospital_name: true,
                medical_condition: true,
                is_critical: true,
            },
        });

        return records;
    }
}

export const recordsService = new RecordsService();
