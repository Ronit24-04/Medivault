import { Router } from 'express';
import { patientsController } from './patients.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadProfilePicture } from '../../middleware/upload.middleware';
import {
    createPatientSchema,
    updatePatientSchema,
    patientIdSchema,
    verifyPatientPinSchema,
} from './patients.validation';

const router = Router();

// Public route for emergency info
router.get('/public/emergency-info', patientsController.getPublicEmergencyInfo.bind(patientsController));

// All other routes require authentication
router.use(authenticate);

router.post('/', validate(createPatientSchema), patientsController.createPatient.bind(patientsController));
router.get('/', patientsController.getPatients.bind(patientsController));
router.get('/:patientId', validate(patientIdSchema), patientsController.getPatientById.bind(patientsController));
router.put('/:patientId', validate(updatePatientSchema), patientsController.updatePatient.bind(patientsController));
router.put(
    '/:patientId/profile-image',
    uploadProfilePicture.single('profileImage'),
    validate(patientIdSchema),
    patientsController.updateProfileImage.bind(patientsController)
);
router.delete(
    '/:patientId/profile-image',
    validate(patientIdSchema),
    patientsController.removeProfileImage.bind(patientsController)
);
router.delete('/:patientId', validate(patientIdSchema), patientsController.deletePatient.bind(patientsController));
router.get('/:patientId/emergency-info', validate(patientIdSchema), patientsController.getEmergencyInfo.bind(patientsController));
router.post('/:patientId/verify-pin', validate(verifyPatientPinSchema), patientsController.verifyProfilePin.bind(patientsController));

export default router;
