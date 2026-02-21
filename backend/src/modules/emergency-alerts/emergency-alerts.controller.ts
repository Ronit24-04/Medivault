import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import { emergencyAlertsService } from './emergency-alerts.service';

export class EmergencyAlertsController {
    async sendAlert(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId, 10);

            if (Number.isNaN(patientId)) {
                throw new AppError(400, 'Invalid patient ID');
            }

            await emergencyAlertsService.sendEmergencyAlert(req.admin!.adminId, patientId);

            res.status(200).json({
                success: true,
                message: 'Emergency SMS sent',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const emergencyAlertsController = new EmergencyAlertsController();
