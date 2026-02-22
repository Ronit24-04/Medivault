import { Response, NextFunction } from 'express';
import { emergencyService } from './emergency.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class EmergencyController {
    async createContact(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const contact = await emergencyService.createContact(req.admin!.adminId, req.body);
            res.status(201).json({
                success: true,
                message: 'Emergency contact created successfully',
                data: contact,
            });
        } catch (error) {
            next(error);
        }
    }

    async getContacts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const contacts = await emergencyService.getContacts(req.admin!.adminId);
            res.status(200).json({
                success: true,
                data: contacts,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateContact(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const contactId = parseInt(req.params.contactId as string);
            const contact = await emergencyService.updateContact(req.admin!.adminId, contactId, req.body);
            res.status(200).json({
                success: true,
                message: 'Contact updated successfully',
                data: contact,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteContact(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const contactId = parseInt(req.params.contactId as string);
            const result = await emergencyService.deleteContact(req.admin!.adminId, contactId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    async createAlert(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await emergencyService.createAlert(req.admin!.adminId, req.body);
            res.status(201).json({
                success: true,
                message: `Emergency alert sent to ${result.contactsNotified} contact(s)`,
                data: result.alert,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAlerts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const alerts = await emergencyService.getAlerts(req.admin!.adminId);
            res.status(200).json({
                success: true,
                data: alerts,
            });
        } catch (error) {
            next(error);
        }
    }

    async acknowledgeAlert(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const alertId = parseInt(req.params.alertId as string);
            const alert = await emergencyService.acknowledgeAlert(req.admin!.adminId, alertId);
            res.status(200).json({
                success: true,
                message: 'Alert acknowledged',
                data: alert,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const emergencyController = new EmergencyController();
