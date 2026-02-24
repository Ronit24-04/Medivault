import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

interface EmergencyLocation {
    latitude?: number;
    longitude?: number;
}

export class EmergencyAlertsService {
    private normalizePhoneNumber(phoneNumber: string): string | null {
        const trimmed = phoneNumber.trim();
        if (!trimmed) {
            return null;
        }

        if (trimmed.startsWith('+')) {
            const digits = trimmed.slice(1).replace(/\D/g, '');
            if (digits.length >= 10 && digits.length <= 15) {
                return `+${digits}`;
            }
            return null;
        }

        const digits = trimmed.replace(/\D/g, '');
        if (digits.length === 10) {
            return `+1${digits}`;
        }
        if (digits.length === 11 && digits.startsWith('1')) {
            return `+${digits}`;
        }
        if (digits.length >= 10 && digits.length <= 15) {
            return `+${digits}`;
        }
        return null;
    }

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
            // No location provided — fall back to any registered webapp hospital
            const anyHospital = await prisma.hospital.findFirst({
                where: { admin_id: { not: 0 } },
                select: { hospital_id: true },
                orderBy: { created_at: 'desc' },
            });
            return anyHospital?.hospital_id ?? null;
        }

        // Find any webapp-registered hospital (has admin_id) with valid coordinates
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
            // Fallback: return any hospital at all
            const anyHospital = await prisma.hospital.findFirst({
                select: { hospital_id: true },
                orderBy: { created_at: 'desc' },
            });
            return anyHospital?.hospital_id ?? null;
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
        // Fetch emergency contacts — but do NOT hard-fail if none exist
        const contacts = await prisma.emergencyContact.findMany({
            where: {
                patient_id: patientId,
                is_active: true,
            },
        });

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

        // Find the nearest registered hospital
        const nearestHospitalId = await this.getNearestHospitalId(location);
        let hospitalDetails = null;
        if (nearestHospitalId) {
            const h = await prisma.hospital.findUnique({
                where: { hospital_id: nearestHospitalId },
                select: {
                    hospital_name: true,
                    address: true,
                    phone_number: true,
                    city: true,
                    state: true,
                }
            });
            if (h) {
                hospitalDetails = {
                    name: h.hospital_name,
                    address: h.address,
                    phone: h.phone_number,
                    city: h.city,
                    state: h.state,
                };
            }
        }

        const patient = await prisma.patient.findUnique({
            where: { patient_id: patientId },
            select: {
                full_name: true,
                blood_type: true,
                allergies: true,
                chronic_conditions: true,
            }
        });

        const criticalSummary = patient ? [
            patient.blood_type ? `Blood: ${patient.blood_type}` : null,
            patient.allergies ? `Allergies: ${patient.allergies}` : null,
            patient.chronic_conditions ? `Conditions: ${patient.chronic_conditions}` : null
        ].filter(Boolean).join(' | ') : null;

        // Always save the alert to the DB regardless of contacts
        const alert = await prisma.emergencyAlert.create({
            data: {
                patient_id: patientId,
                hospital_id: nearestHospitalId,
                patient_location:
                    location?.latitude !== undefined && location?.longitude !== undefined
                        ? `${location.latitude},${location.longitude}`
                        : null,
                alert_message: '🚨 EMERGENCY ALERT FROM MEDIVAULT',
                critical_summary: criticalSummary,
                status: 'sent',
                sent_to_hospital: nearestHospitalId ? (true as any) : (false as any),
                sent_to_contacts: false as any,
                sent_at: new Date(),
            },
            include: {
                patient: {
                    select: {
                        full_name: true,
                        blood_type: true,
                        allergies: true,
                        chronic_conditions: true,
                    }
                }
            }
        });

        // If Twilio is not configured or contacts don't exist, still succeed
        if (hasPlaceholderConfig || !contacts.length) {
            if (!contacts.length) {
                console.warn('No active emergency contacts — alert saved to hospital only.');
            } else {
                console.warn('Emergency SMS skipped: Twilio is not configured');
            }
            return { ...alert, hospital_details: hospitalDetails };
        }

        let twilioClientFactory: any;
        try {
            twilioClientFactory = require('twilio');
        } catch (error) {
            console.warn('Emergency SMS skipped: Twilio SDK is not installed');
            return { ...alert, hospital_details: hospitalDetails };
        }

        const client: any = twilioClientFactory(accountSid, authToken);

        const recipients = contacts
            .map((contact) => ({
                contactId: contact.contact_id,
                to: this.normalizePhoneNumber(contact.phone_number),
            }))
            .filter((recipient) => recipient.to !== null) as Array<{
                contactId: number;
                to: string;
            }>;

        if (!recipients.length) {
            // No valid phone numbers — still succeed, just no SMS sent
            console.warn('No valid emergency contact phone numbers found — skipping SMS.');
            return { ...alert, hospital_details: hospitalDetails };
        }

        const results = await Promise.allSettled(
            recipients.map((recipient) =>
                client.messages.create({
                    body: '🚨 Emergency Alert! Patient needs help. Open Medivault.',
                    from: fromPhoneNumber,
                    to: recipient.to,
                })
            )
        );

        const successfulContactIds: number[] = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successfulContactIds.push(recipients[index].contactId);
                return;
            }
            console.error('Twilio delivery failure:', result.reason);
        });

        if (successfulContactIds.length > 0) {
            await prisma.emergencyAlert.update({
                where: { alert_id: alert.alert_id },
                data: {
                    sent_to_contacts: true as any,
                    contact_ids_notified: successfulContactIds.join(','),
                },
            });
        }

        return { ...alert, hospital_details: hospitalDetails };
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
