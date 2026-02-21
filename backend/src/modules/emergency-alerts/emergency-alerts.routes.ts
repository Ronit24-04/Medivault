import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { emergencyAlertsController } from './emergency-alerts.controller';

const router = Router();

router.post(
    '/:patientId/send-alert',
    authenticate,
    emergencyAlertsController.sendAlert.bind(emergencyAlertsController)
);

export default router;
