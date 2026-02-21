import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class EmergencyAlertsService {
    async sendEmergencyAlert(adminId: number, patientId: number) {
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

        if (!accountSid || !authToken || !fromPhoneNumber) {
            throw new AppError(500, 'Twilio configuration is missing');
        }

        const alert = await prisma.emergencyAlert.create({
            data: {
                patient_id: patientId,
                alert_message: '🚨 EMERGENCY ALERT FROM MEDIVAULT',
                status: 'sent',
                sent_to_contacts: true,
                sent_at: new Date(),
            },
        });

        let twilioClientFactory: any;
        try {
            twilioClientFactory = require('twilio');
        } catch (error) {
            throw new AppError(500, 'Twilio SDK is not installed');
        }

        const client = twilioClientFactory(accountSid, authToken);

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
        } catch (error) {
            throw new AppError(500, 'Failed to send emergency SMS');
        }

        return alert;
    }
}

export const emergencyAlertsService = new EmergencyAlertsService();
