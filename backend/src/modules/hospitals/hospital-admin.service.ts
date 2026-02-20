import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

interface UpdateHospitalProfileData {
    hospitalName?: string;
    address?: string;
    city?: string;
    state?: string;
    phoneNumber?: string;
    email?: string;
}

export class HospitalAdminService {
    private async getHospitalByAdminId(adminId: number) {
        return prisma.hospital.findFirst({
            where: { admin_id: adminId },
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
                hospital_type: 'General',
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

    async getAlerts(adminId: number) {
        const hospital = await this.getHospitalByAdminId(adminId);
        if (!hospital) return [];

        return prisma.emergencyAlert.findMany({
            where: { hospital_id: hospital.hospital_id },
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
}

export const hospitalAdminService = new HospitalAdminService();
