import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { sendSharedAccessEmail } from '../../utils/email.util';
import { env } from '../../config/env';

interface CreateShareData {
    hospitalId?: number;
    contactId?: number;
    providerName: string;
    providerType: string;
    accessLevel: string;
    expiresOn?: string;
    sharedRecordIds?: string;
}

interface UpdateShareData {
    accessLevel?: string;
    expiresOn?: string;
    status?: string;
}

export class SharedAccessService {
    private async getOrCreateHospitalProfile(adminId: number, email: string) {
        const existing = await prisma.hospital.findFirst({
            where: { admin_id: adminId },
            select: {
                hospital_id: true,
                hospital_name: true,
            },
        });

        if (existing) {
            return existing;
        }

        const fallbackName = email.split('@')[0].replace(/[._-]/g, ' ').trim() || 'Hospital';

        return prisma.hospital.create({
            data: {
                admin_id: adminId,
                hospital_name: fallbackName,
                address: '',
                city: '',
                state: '',
                phone_number: '',
                email,
                hospital_type: 'private',
            },
            select: {
                hospital_id: true,
                hospital_name: true,
            },
        });
    }

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
                        name: true,
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
        let hospitalProfile: { hospital_id: number; hospital_name: string } | null = null;
        let recipientEmail: string | null = null;

        if (data.hospitalId) {
            const hospital = await prisma.hospital.findUnique({
                where: { hospital_id: data.hospitalId },
                select: {
                    hospital_id: true,
                    hospital_name: true,
                    email: true,
                    admin_id: true,
                },
            });

            if (!hospital) {
                throw new AppError(404, 'Hospital not found');
            }

            hospitalProfile = {
                hospital_id: hospital.hospital_id,
                hospital_name: hospital.hospital_name,
            };
            recipientEmail = hospital.email ?? null;
        } else {
            const isProviderEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.providerName);
            if (!isProviderEmail) {
                throw new AppError(400, 'Please select a hospital from the list');
            }

            const hospitalAdmin = await prisma.admin.findFirst({
                where: {
                    email: data.providerName,
                    user_type: 'hospital',
                    account_status: 'active',
                },
                select: {
                    admin_id: true,
                    email: true,
                },
            });

            if (!hospitalAdmin) {
                throw new AppError(403, 'Access denied. Hospital is not registered on MediVault');
            }

            hospitalProfile = await this.getOrCreateHospitalProfile(
                hospitalAdmin.admin_id,
                data.providerName
            );
            recipientEmail = hospitalAdmin.email;
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
                hospital_id: hospitalProfile.hospital_id,
                contact_id: data.contactId,
                provider_name: hospitalProfile.hospital_name,
                provider_type: 'Hospital',
                access_level: data.accessLevel,
                expires_on: data.expiresOn ? new Date(data.expiresOn) : null,
                shared_record_ids: data.sharedRecordIds,
                // Hospital shares start as pending until the hospital accepts
                status: data.providerType === 'Hospital' ? 'pending' : 'active',
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
                        name: true,
                        relationship: true,
                        phone_number: true,
                    },
                },
            },
        });

        const shareUrl = `${env.FRONTEND_URL}/shared/${share.share_id}`;

        if (recipientEmail) {
            try {
                await sendSharedAccessEmail(recipientEmail, {
                    providerName: hospitalProfile.hospital_name,
                    accessLevel: data.accessLevel,
                    expiresOn: data.expiresOn,
                    shareUrl,
                });
            } catch (_error) {
                // Keep share creation successful even if notification email fails.
                console.error('Failed to send shared access email:', {
                    to: recipientEmail,
                    shareId: share.share_id,
                });
            }
        }

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
                        name: true,
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
