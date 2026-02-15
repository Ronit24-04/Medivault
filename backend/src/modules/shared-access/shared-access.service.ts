import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

interface CreateShareData {
    hospitalId?: number;
    contactId?: number;
    providerName: string;
    providerType: string;
    accessLevel: string;
    expiresOn?: string;
}

interface UpdateShareData {
    accessLevel?: string;
    expiresOn?: string;
    status?: string;
}

export class SharedAccessService {
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

    async getSharedAccess(adminId: number, patientId: number) {
        await this.verifyPatientOwnership(adminId, patientId);

        const shares = await prisma.sharedAccess.findMany({
            where: { patient_id: patientId },
            include: {
                hospital: {
                    select: {
                        hospital_id: true,
                        hospital_name: true,
                        hospital_type: true,
                    },
                },
                emergencyContact: {
                    select: {
                        contact_id: true,
                        contact_name: true,
                        relationship: true,
                        phone_number: true,
                    },
                },
            },
            orderBy: { shared_on: 'desc' },
        });

        return shares;
    }

    async createShare(adminId: number, patientId: number, data: CreateShareData) {
        await this.verifyPatientOwnership(adminId, patientId);

        if (data.hospitalId) {
            const hospital = await prisma.hospital.findUnique({
                where: { hospital_id: data.hospitalId },
            });
            if (!hospital) {
                throw new AppError(404, 'Hospital not found');
            }
        }

        if (data.contactId) {
            const contact = await prisma.emergencyContact.findFirst({
                where: {
                    contact_id: data.contactId,
                    patient_id: patientId,
                },
            });
            if (!contact) {
                throw new AppError(404, 'Emergency contact not found');
            }
        }

        const share = await prisma.sharedAccess.create({
            data: {
                patient_id: patientId,
                hospital_id: data.hospitalId,
                contact_id: data.contactId,
                provider_name: data.providerName,
                provider_type: data.providerType,
                access_level: data.accessLevel,
                expires_on: data.expiresOn ? new Date(data.expiresOn) : null,
            },
            include: {
                hospital: {
                    select: {
                        hospital_id: true,
                        hospital_name: true,
                        hospital_type: true,
                    },
                },
                emergencyContact: {
                    select: {
                        contact_id: true,
                        contact_name: true,
                        relationship: true,
                        phone_number: true,
                    },
                },
            },
        });

        return share;
    }

    async updateShare(adminId: number, patientId: number, shareId: number, data: UpdateShareData) {
        await this.verifyPatientOwnership(adminId, patientId);

        const existingShare = await prisma.sharedAccess.findFirst({
            where: {
                share_id: shareId,
                patient_id: patientId,
            },
        });

        if (!existingShare) {
            throw new AppError(404, 'Shared access not found');
        }

        const share = await prisma.sharedAccess.update({
            where: { share_id: shareId },
            data: {
                access_level: data.accessLevel,
                expires_on: data.expiresOn ? new Date(data.expiresOn) : undefined,
                status: data.status,
            },
            include: {
                hospital: {
                    select: {
                        hospital_id: true,
                        hospital_name: true,
                        hospital_type: true,
                    },
                },
                emergencyContact: {
                    select: {
                        contact_id: true,
                        contact_name: true,
                        relationship: true,
                        phone_number: true,
                    },
                },
            },
        });

        return share;
    }

    async revokeShare(adminId: number, patientId: number, shareId: number) {
        await this.verifyPatientOwnership(adminId, patientId);

        const share = await prisma.sharedAccess.findFirst({
            where: {
                share_id: shareId,
                patient_id: patientId,
            },
        });

        if (!share) {
            throw new AppError(404, 'Shared access not found');
        }

        await prisma.sharedAccess.update({
            where: { share_id: shareId },
            data: { status: 'revoked' },
        });

        return { message: 'Access revoked successfully' };
    }

    async getStats(adminId: number, patientId: number) {
        await this.verifyPatientOwnership(adminId, patientId);

        const [activeShares, totalShares, totalRecordsAccessed] = await Promise.all([
            prisma.sharedAccess.count({
                where: {
                    patient_id: patientId,
                    status: 'active',
                },
            }),
            prisma.sharedAccess.count({
                where: { patient_id: patientId },
            }),
            prisma.sharedAccess.aggregate({
                where: { patient_id: patientId },
                _sum: {
                    records_accessed_count: true,
                },
            }),
        ]);

        return {
            activeShares,
            totalShares,
            totalRecordsAccessed: totalRecordsAccessed._sum.records_accessed_count || 0,
            pendingRequests: 0,
        };
    }
}

export const sharedAccessService = new SharedAccessService();
