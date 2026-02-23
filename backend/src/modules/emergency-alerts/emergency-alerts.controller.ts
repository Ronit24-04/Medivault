import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import { emergencyAlertsService } from './emergency-alerts.service';

export class EmergencyAlertsController {
    async sendAlert(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(
                Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId,
                10
            );
            const latitude =
                req.body?.latitude !== undefined ? Number(req.body.latitude) : undefined;
            const longitude =
                req.body?.longitude !== undefined ? Number(req.body.longitude) : undefined;

            if (Number.isNaN(patientId)) {
                throw new AppError(400, 'Invalid patient ID');
            }

            const result = await emergencyAlertsService.sendEmergencyAlert(req.admin!.adminId, patientId, {
                latitude: Number.isFinite(latitude) ? latitude : undefined,
                longitude: Number.isFinite(longitude) ? longitude : undefined,
            });

            res.status(200).json({
                success: true,
                message: 'Emergency SMS sent',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async sendPublicAlert(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const email = String(req.body?.email || '').trim().toLowerCase();
            const latitude =
                req.body?.latitude !== undefined ? Number(req.body.latitude) : undefined;
            const longitude =
                req.body?.longitude !== undefined ? Number(req.body.longitude) : undefined;

            if (!email) {
                throw new AppError(400, 'Email is required');
            }

            const result = await emergencyAlertsService.sendEmergencyAlertByEmail(email, {
                latitude: Number.isFinite(latitude) ? latitude : undefined,
                longitude: Number.isFinite(longitude) ? longitude : undefined,
            });

            res.status(200).json({
                success: true,
                message: 'Emergency SMS sent',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export const emergencyAlertsController = new EmergencyAlertsController();
