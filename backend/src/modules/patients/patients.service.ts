import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

interface CreatePatientData {
    fullName: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodType?: string;
    height?: number;
    weight?: number;
    allergies?: string;
    chronicConditions?: string;
    currentMedications?: string;
    relationship: string;
    isPrimary?: boolean;
}

export class PatientsService {
    async createPatient(adminId: number, data: CreatePatientData) {
        // If this is set as primary, unset other primary patients
        if (data.isPrimary) {
            await prisma.patient.updateMany({
                where: { admin_id: adminId, is_primary: true },
                data: { is_primary: false },
            });
        }

        const patient = await prisma.patient.create({
            data: {
                admin_id: adminId,
                full_name: data.fullName,
                address: data.address || '',
                date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date('2000-01-01'),
                gender: data.gender,
                blood_type: data.bloodType,
                height_cm: data.height,
                weight_kg: data.weight,
                relationship: data.relationship,
                is_primary: data.isPrimary || false,
            },
        });

        return patient;
    }

    async getPatients(adminId: number) {
        const patients = await prisma.patient.findMany({
            where: { admin_id: adminId },
            orderBy: [
                { is_primary: 'desc' },
                { created_at: 'desc' },
            ],
        });

        return patients;
    }

    async getPatientById(adminId: number, patientId: number) {
        const patient = await prisma.patient.findFirst({
            where: {
                patient_id: patientId,
                admin_id: adminId,
            },
            include: {
                _count: {
                    select: {
                        medicalRecords: true,
                    },
                },
            },
        });

        if (!patient) {
            throw new AppError(404, 'Patient not found');
        }

        return patient;
    }

    async updatePatient(adminId: number, patientId: number, data: Partial<CreatePatientData>) {
        // Verify ownership
        const existingPatient = await prisma.patient.findFirst({
            where: {
                patient_id: patientId,
                admin_id: adminId,
            },
        });

        if (!existingPatient) {
            throw new AppError(404, 'Patient not found');
        }

        // If setting as primary, unset other primary patients
        if (data.isPrimary) {
            await prisma.patient.updateMany({
                where: {
                    admin_id: adminId,
                    is_primary: true,
                    patient_id: { not: patientId },
                },
                data: { is_primary: false },
            });
        }

        const patient = await prisma.patient.update({
            where: { patient_id: patientId },
            data: {
                full_name: data.fullName,
                address: data.address,
                date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                gender: data.gender,
                blood_type: data.bloodType,
                height_cm: data.height,
                weight_kg: data.weight,
                relationship: data.relationship,
                is_primary: data.isPrimary,
            },
        });

        return patient;
    }

    async updateProfileImage(adminId: number, patientId: number, profileImagePath: string) {
        const existingPatient = await prisma.patient.findFirst({
            where: {
                patient_id: patientId,
                admin_id: adminId,
            },
        });

        if (!existingPatient) {
            throw new AppError(404, 'Patient not found');
        }

        const patient = await prisma.patient.update({
            where: { patient_id: patientId },
            data: {
                profile_image: profileImagePath,
            },
        });

        return patient;
    }

    async deletePatient(adminId: number, patientId: number) {
        // Verify ownership
        const patient = await prisma.patient.findFirst({
            where: {
                patient_id: patientId,
                admin_id: adminId,
            },
        });

        if (!patient) {
            throw new AppError(404, 'Patient not found');
        }

        await prisma.patient.delete({
            where: { patient_id: patientId },
        });

        return { message: 'Patient deleted successfully' };
    }

    async getEmergencyInfo(adminId: number, patientId: number) {
        const patient = await prisma.patient.findFirst({
            where: {
                patient_id: patientId,
                admin_id: adminId,
            },
            select: {
                patient_id: true,
                full_name: true,
                date_of_birth: true,
                blood_type: true,
            },
        });

        if (!patient) {
            throw new AppError(404, 'Patient not found');
        }

        return patient;
    }
}

export const patientsService = new PatientsService();
