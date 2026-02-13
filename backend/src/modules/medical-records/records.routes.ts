import { Router } from 'express';
import { recordsController } from './records.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadMedicalRecord } from '../../middleware/upload.middleware';
import {
    uploadRecordSchema,
    getRecordsSchema,
    recordIdSchema,
    updateRecordSchema,
} from './records.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
    '/:patientId/records',
    uploadMedicalRecord.single('file'),
    validate(uploadRecordSchema),
    recordsController.uploadRecord.bind(recordsController)
);

router.get(
    '/:patientId/records',
    validate(getRecordsSchema),
    recordsController.getRecords.bind(recordsController)
);

router.get(
    '/:patientId/records/timeline',
    validate({ params: { patientId: 'string' } } as any),
    recordsController.getTimeline.bind(recordsController)
);

router.get(
    '/:patientId/records/:recordId',
    validate(recordIdSchema),
    recordsController.getRecordById.bind(recordsController)
);

router.put(
    '/:patientId/records/:recordId',
    validate(updateRecordSchema),
    recordsController.updateRecord.bind(recordsController)
);

router.delete(
    '/:patientId/records/:recordId',
    validate(recordIdSchema),
    recordsController.deleteRecord.bind(recordsController)
);

export default router;
