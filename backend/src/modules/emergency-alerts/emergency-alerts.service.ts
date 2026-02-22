import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

interface EmergencyLocation {
    latitude?: number;
    longitude?: number;
}

export class EmergencyAlertsService {
    private toRadians(value: number) {
        return (value * Math.PI) / 180;
    }

    private distanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
        const earthRadiusKm = 6371;
        const dLat = this.toRadians(toLat - fromLat);
        const dLng = this.toRadians(toLng - fromLng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(fromLat)) *
            Math.cos(this.toRadians(toLat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }

    private async getNearestHospitalId(location?: EmergencyLocation) {
        if (
            location?.latitude === undefined ||
            location?.longitude === undefined
        ) {
            return null;
        }

        const hospitals = await prisma.hospital.findMany({
            where: {
                latitude: { not: null },
                longitude: { not: null },
            },
            select: {
                hospital_id: true,
                latitude: true,
                longitude: true,
            },
        });

        if (!hospitals.length) {
            return null;
        }

        let nearestHospitalId: number | null = null;
        let nearestDistance = Number.POSITIVE_INFINITY;

        for (const hospital of hospitals) {
            if (hospital.latitude === null || hospital.longitude === null) {
                continue;
            }

            const distance = this.distanceKm(
                location.latitude,
                location.longitude,
                hospital.latitude,
                hospital.longitude
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestHospitalId = hospital.hospital_id;
            }
        }

        return nearestHospitalId;
    }

    private async dispatchEmergencySms(patientId: number, location?: EmergencyLocation) {
        const contacts = await prisma.emergencyContact.findMany({
            where: {
                patient_id: patientId,
                is_active: true,
            },
        });

        if (!contacts.length) {
            throw new AppError(404, 'No active emergency contacts found');
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        const hasPlaceholderConfig =
            !accountSid ||
            !authToken ||
            !fromPhoneNumber ||
            accountSid.includes('your_twilio_account_sid') ||
            authToken.includes('your_twilio_auth_token') ||
            fromPhoneNumber.includes('XXXXXXXX');

        if (hasPlaceholderConfig) {
            throw new AppError(500, 'Twilio is not configured. Add real TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
        }

        const nearestHospitalId = await this.getNearestHospitalId(location);

        const alert = await prisma.emergencyAlert.create({
            data: {
                patient_id: patientId,
                hospital_id: nearestHospitalId,
                patient_location:
                    location?.latitude !== undefined && location?.longitude !== undefined
                        ? `${location.latitude},${location.longitude}`
                        : null,
                alert_message: '🚨 EMERGENCY ALERT FROM MEDIVAULT',
                status: 'sent',
                sent_to_hospital: nearestHospitalId ? (true as any) : (false as any),
                sent_to_contacts: true as any,
                sent_at: new Date(),
            },
        });

        let twilioClientFactory: any;
        try {
            twilioClientFactory = require('twilio');
        } catch (error) {
            throw new AppError(500, 'Twilio SDK is not installed');
        }

        const client: any = twilioClientFactory(accountSid, authToken);

        try {
            await Promise.all(
                contacts.map((contact) =>
                    client.messages.create({
                        body: '🚨 Emergency Alert! Patient needs help. Open Medivault.',
                        from: fromPhoneNumber,
                        to: contact.phone_number,
                    })
                )
            );
        } catch (error: any) {
            const twilioMessage = error?.message || 'Failed to send emergency SMS';
            console.error('Twilio error:', error);
            // Don't throw if we want the alert record to stay, but here we throw
            throw new AppError(500, twilioMessage);
        }

        return alert;
    }

    async sendEmergencyAlert(adminId: number, patientId: number, location?: EmergencyLocation) {
        const patient = await prisma.patient.findFirst({
            where: {
                patient_id: patientId,
                admin_id: adminId,
            },
            select: {
                patient_id: true,
            },
        });

        if (!patient) {
            throw new AppError(404, 'Patient not found');
        }

        return this.dispatchEmergencySms(patientId, location);
    }

    async sendEmergencyAlertByEmail(email: string, location?: EmergencyLocation) {
        const admin = await prisma.admin.findFirst({
            where: {
                email,
                user_type: 'patient',
            },
            select: {
                admin_id: true,
            },
        });

        if (!admin) {
            throw new AppError(404, 'Patient account not found for this email');
        }

        const patient = await prisma.patient.findFirst({
            where: { admin_id: admin.admin_id },
            orderBy: [{ is_primary: 'desc' }, { created_at: 'asc' }],
            select: { patient_id: true },
        });

        if (!patient) {
            throw new AppError(404, 'No patient profile found for this account');
        }

        return this.dispatchEmergencySms(patient.patient_id, location);
    }
}

export const emergencyAlertsService = new EmergencyAlertsService();
