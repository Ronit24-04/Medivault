import prisma from '../../config/database';
import { sendEmergencyAlert } from '../../utils/email.util';
import { AppError } from '../../middleware/error.middleware';

interface CreateContactData {
    patientId: number;
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    priority?: number;
}

interface CreateAlertData {
    patientId: number;
    hospitalId?: number;
    patientLocation?: string;
    criticalSummary?: string;
    alertMessage: string;
}

export class EmergencyService {
    async createContact(adminId: number, data: CreateContactData) {
        // Verify patient ownership
        const patient = await prisma.patient.findFirst({
            where: {
                patient_id: data.patientId,
                admin_id: adminId,
            },
        });

        if (!patient) {
            throw new AppError(404, 'Patient not found');
        }

        const contact = await prisma.emergencyContact.create({
            data: {
                patient_id: data.patientId,
                name: data.name,
                relationship: data.relationship,
                phone_number: data.phoneNumber,
                email: data.email,
                priority: data.priority || 1,
            },
        });

        return contact;
    }

    async getContacts(adminId: number) {
        // Get all patients belonging to this admin to filter contacts
        const patients = await prisma.patient.findMany({
            where: { admin_id: adminId },
            select: { patient_id: true },
        });
        const patientIds = patients.map(p => p.patient_id);

        const contacts = await prisma.emergencyContact.findMany({
            where: {
                patient_id: { in: patientIds },
                is_active: true,
            },
            orderBy: { priority: 'asc' },
        });

        return contacts;
    }

    async updateContact(adminId: number, contactId: number, data: Partial<CreateContactData>) {
        // Find contact and verify via patient ownership
        const contact = await prisma.emergencyContact.findFirst({
            where: { contact_id: contactId },
            include: { patient: { select: { admin_id: true } } },
        });

        if (!contact || contact.patient.admin_id !== adminId) {
            throw new AppError(404, 'Contact not found');
        }

        const updated = await prisma.emergencyContact.update({
            where: { contact_id: contactId },
            data: {
                name: data.name,
                relationship: data.relationship,
                phone_number: data.phoneNumber,
                email: data.email,
                priority: data.priority,
            },
        });

        return updated;
    }

    async deleteContact(adminId: number, contactId: number) {
        const contact = await prisma.emergencyContact.findFirst({
            where: { contact_id: contactId },
            include: { patient: { select: { admin_id: true } } },
        });

        if (!contact || contact.patient.admin_id !== adminId) {
            throw new AppError(404, 'Contact not found');
        }

        await prisma.emergencyContact.update({
            where: { contact_id: contactId },
            data: { is_active: false },
        });

        return { message: 'Contact deleted successfully' };
    }

    async createAlert(adminId: number, data: CreateAlertData) {
        // Verify patient ownership
        const patient = await prisma.patient.findFirst({
            where: {
                patient_id: data.patientId,
                admin_id: adminId,
            },
        });

        if (!patient) {
            throw new AppError(404, 'Patient not found');
        }

        // Get emergency contacts
        const contacts = await prisma.emergencyContact.findMany({
            where: {
                patient_id: data.patientId,
                is_active: true,
            },
            orderBy: { priority: 'asc' },
        });

        // Create alert
        const alert = await prisma.emergencyAlert.create({
            data: {
                patient_id: data.patientId,
                hospital_id: data.hospitalId,
                patient_location: data.patientLocation,
                critical_summary: data.criticalSummary,
                alert_message: data.alertMessage,
                status: 'sent',
                sent_to_contacts: contacts.length > 0,
                contact_ids_notified: contacts.map(c => c.contact_id).join(','),
                sent_at: new Date(),
            },
        });

        // Send emails to all contacts
        const emailPromises = contacts
            .filter(contact => contact.email)
            .map(contact =>
                sendEmergencyAlert(
                    contact.email!,
                    patient.full_name,
                    data.alertMessage,
                    data.patientLocation
                )
            );

        await Promise.allSettled(emailPromises);

        return {
            alert,
            contactsNotified: contacts.length,
        };
    }

    async getAlerts(adminId: number) {
        // Get all patients for this admin
        const patients = await prisma.patient.findMany({
            where: { admin_id: adminId },
            select: { patient_id: true },
        });

        const patientIds = patients.map(p => p.patient_id);

        const alerts = await prisma.emergencyAlert.findMany({
            where: {
                patient_id: { in: patientIds },
            },
            include: {
                patient: {
                    select: {
                        full_name: true,
                    },
                },
            },
            orderBy: { sent_at: 'desc' },
        });

        return alerts;
    }

    async acknowledgeAlert(adminId: number, alertId: number) {
        const alert = await prisma.emergencyAlert.findUnique({
            where: { alert_id: alertId },
            include: { patient: true },
        });

        if (!alert) {
            throw new AppError(404, 'Alert not found');
        }

        // Verify ownership
        if (alert.patient.admin_id !== adminId) {
            throw new AppError(403, 'Access denied');
        }

        const updated = await prisma.emergencyAlert.update({
            where: { alert_id: alertId },
            data: {
                status: 'acknowledge',
                acknowledged_at: new Date(),
            },
        });

        return updated;
    }
}

export const emergencyService = new EmergencyService();
