import { Router } from 'express';
import { emergencyController } from './emergency.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
    createContactSchema,
    updateContactSchema,
    createAlertSchema,
} from './emergency.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Emergency contacts
router.post('/contacts', validate(createContactSchema), emergencyController.createContact.bind(emergencyController));
router.get('/contacts', emergencyController.getContacts.bind(emergencyController));
router.put('/contacts/:contactId', validate(updateContactSchema), emergencyController.updateContact.bind(emergencyController));
router.delete('/contacts/:contactId', emergencyController.deleteContact.bind(emergencyController));

// Emergency alerts
router.post('/alerts', validate(createAlertSchema), emergencyController.createAlert.bind(emergencyController));
router.get('/alerts', emergencyController.getAlerts.bind(emergencyController));
router.post('/alerts/:alertId/acknowledge', emergencyController.acknowledgeAlert.bind(emergencyController));

export default router;
