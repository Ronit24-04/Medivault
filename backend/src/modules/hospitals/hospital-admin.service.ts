import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

interface UpdateHospitalProfileData {
    hospitalName?: string;
    address?: string;
    city?: string;
    state?: string;
    phoneNumber?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
}

type SharedRecordStatus = 'acknowledged' | 'rejected';

export class HospitalAdminService {
    private async getHospitalByAdminId(adminId: number) {
        const hospitalByAdmin = await prisma.hospital.findFirst({
            where: { admin_id: adminId },
        });

        if (hospitalByAdmin) {
            return hospitalByAdmin;
        }

        // Backward compatibility: link legacy hospital rows created without admin_id
        const admin = await prisma.admin.findUnique({
            where: { admin_id: adminId },
            select: { email: true },
        });

        if (!admin?.email) {
            return null;
        }

        const hospitalByEmail = await prisma.hospital.findFirst({
            where: { email: admin.email },
        });

        if (!hospitalByEmail) {
            return null;
        }

        return prisma.hospital.update({
            where: { hospital_id: hospitalByEmail.hospital_id },
            data: { admin_id: adminId },
        });
    }

    async getProfile(adminId: number) {
        return this.getHospitalByAdminId(adminId);
    }

    async updateProfile(adminId: number, data: UpdateHospitalProfileData) {
        const hospital = await this.getHospitalByAdminId(adminId);

        if (hospital) {
            return prisma.hospital.update({
                where: { hospital_id: hospital.hospital_id },
                data: {
                    ...(data.hospitalName !== undefined && { hospital_name: data.hospitalName }),
                    ...(data.address !== undefined && { address: data.address }),
                    ...(data.city !== undefined && { city: data.city }),
                    ...(data.state !== undefined && { state: data.state }),
                    ...(data.phoneNumber !== undefined && { phone_number: data.phoneNumber }),
                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.latitude !== undefined && { latitude: data.latitude }),
                    ...(data.longitude !== undefined && { longitude: data.longitude }),
                },
            });
        }

        return prisma.hospital.create({
            data: {
                admin_id: adminId,
                hospital_name: data.hospitalName || 'My Hospital',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                phone_number: data.phoneNumber || '',
                email: data.email,
                latitude: data.latitude,
                longitude: data.longitude,
                hospital_type: 'private',
            },
        });
    }

    async getSharedRecords(adminId: number) {
        const hospital = await this.getHospitalByAdminId(adminId);
        if (!hospital) return [];

        return prisma.sharedAccess.findMany({
            where: { hospital_id: hospital.hospital_id },
            include: {
                patient: {
                    select: {
                        patient_id: true,
                        full_name: true,
                        date_of_birth: true,
                        gender: true,
                    },
                },
            },
            orderBy: { shared_on: 'desc' },
        });
    }

    async updateSharedRecordStatus(adminId: number, shareId: number, status: SharedRecordStatus) {
        const hospital = await this.getHospitalByAdminId(adminId);
        if (!hospital) throw new AppError(404, 'Hospital profile not found');

        const share = await prisma.sharedAccess.findFirst({
            where: {
                share_id: shareId,
                hospital_id: hospital.hospital_id,
            },
        });

        if (!share) {
            throw new AppError(404, 'Shared record not found');
        }

        return prisma.sharedAccess.update({
            where: { share_id: shareId },
            data: { status },
        });
    }

    async getSharedRecordFiles(adminId: number, shareId: number) {
        const hospital = await this.getHospitalByAdminId(adminId);
        if (!hospital) {
            throw new AppError(404, 'Hospital profile not found');
        }

        const share = await prisma.sharedAccess.findFirst({
            where: {
                share_id: shareId,
                hospital_id: hospital.hospital_id,
                status: 'active',
            },
        });

        if (!share) {
            throw new AppError(404, 'Shared access not found');
        }

        const records = await prisma.medicalRecord.findMany({
            where: {
                patient_id: share.patient_id,
            },
            orderBy: { record_date: 'desc' },
            select: {
                record_id: true,
                title: true,
                category: true,
                record_date: true,
                file_path: true,
                file_type: true,
                description: true,
            },
        });

        return records;
    }

    async getAlerts(adminId: number) {
        const hospital = await this.getHospitalByAdminId(adminId);
        if (!hospital) return [];

        return prisma.emergencyAlert.findMany({
            where: {
                hospital_id: hospital.hospital_id,
                sent_to_hospital: true,
                status: { not: 'acknowledge' },
                NOT: [
                    { alert_message: { contains: 'record access shared' } },
                    { alert_message: { contains: 'shared access' } },
                ],
            },
            include: {
                patient: {
                    select: {
                        patient_id: true,
                        full_name: true,
                    },
                },
            },
            orderBy: { sent_at: 'desc' },
        });
    }

    async acknowledgeAlert(adminId: number, alertId: number) {
        const hospital = await this.getHospitalByAdminId(adminId);
        if (!hospital) throw new AppError(404, 'Hospital profile not found');

        const alert = await prisma.emergencyAlert.findFirst({
            where: {
                alert_id: alertId,
                hospital_id: hospital.hospital_id,
            },
        });

        if (!alert) {
            throw new AppError(404, 'Alert not found');
        }

        return prisma.emergencyAlert.update({
            where: { alert_id: alertId },
            data: {
                status: 'acknowledge',
                acknowledged_at: new Date(),
            },
        });
    }

    async acceptShare(adminId: number, shareId: number) {
        const hospital = await this.getHospitalByAdminId(adminId);
        if (!hospital) throw new AppError(404, 'Hospital profile not found');

        const share = await prisma.sharedAccess.findFirst({
            where: {
                share_id: shareId,
                hospital_id: hospital.hospital_id,
            },
        });

        if (!share) throw new AppError(404, 'Shared access not found');

        return prisma.sharedAccess.update({
            where: { share_id: shareId },
            data: { status: 'active' },
            include: {
                patient: {
                    select: { patient_id: true, full_name: true, date_of_birth: true, gender: true },
                },
            },
        });
    }

    async rejectShare(adminId: number, shareId: number) {
        const hospital = await this.getHospitalByAdminId(adminId);
        if (!hospital) throw new AppError(404, 'Hospital profile not found');

        const share = await prisma.sharedAccess.findFirst({
            where: {
                share_id: shareId,
                hospital_id: hospital.hospital_id,
            },
        });

        if (!share) throw new AppError(404, 'Shared access not found');

        return prisma.sharedAccess.update({
            where: { share_id: shareId },
            data: { status: 'rejected' },
            include: {
                patient: {
                    select: { patient_id: true, full_name: true, date_of_birth: true, gender: true },
                },
            },
        });
    }
}

export const hospitalAdminService = new HospitalAdminService();
