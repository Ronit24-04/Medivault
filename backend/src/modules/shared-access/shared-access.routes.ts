import { Router } from 'express';
import { sharedAccessController } from './shared-access.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { createShareSchema, updateShareSchema } from './shared-access.validation';

const router = Router();

router.use(authenticate);

router.get(
    '/:patientId/shared-access',
    sharedAccessController.getSharedAccess.bind(sharedAccessController)
);

router.get(
    '/:patientId/shared-access/stats',
    sharedAccessController.getStats.bind(sharedAccessController)
);

router.post(
    '/:patientId/shared-access',
    validate(createShareSchema),
    sharedAccessController.createShare.bind(sharedAccessController)
);

router.put(
    '/:patientId/shared-access/:shareId',
    validate(updateShareSchema),
    sharedAccessController.updateShare.bind(sharedAccessController)
);

router.delete(
    '/:patientId/shared-access/:shareId',
    sharedAccessController.revokeShare.bind(sharedAccessController)
);

export default router;
