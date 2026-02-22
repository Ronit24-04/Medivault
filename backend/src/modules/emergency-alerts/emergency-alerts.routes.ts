import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { emergencyPinLimiter } from '../../middleware/rateLimit.middleware';
import { emergencyAlertsController } from './emergency-alerts.controller';

const router = Router();

router.post(
    '/public/send-alert',
    emergencyPinLimiter,
    emergencyAlertsController.sendPublicAlert.bind(emergencyAlertsController)
);

router.post(
    '/:patientId/send-alert',
    authenticate,
    emergencyAlertsController.sendAlert.bind(emergencyAlertsController)
);

export default router;
