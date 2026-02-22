import { Router } from 'express';
import { hospitalAdminController } from './hospital-admin.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', hospitalAdminController.getProfile.bind(hospitalAdminController));
router.put('/profile', hospitalAdminController.updateProfile.bind(hospitalAdminController));
router.get('/shared-records', hospitalAdminController.getSharedRecords.bind(hospitalAdminController));
router.get('/shared-records/:shareId/files', hospitalAdminController.getSharedRecordFiles.bind(hospitalAdminController));
router.post('/shared-records/:shareId/status', hospitalAdminController.updateSharedRecordStatus.bind(hospitalAdminController));
router.get('/alerts', hospitalAdminController.getAlerts.bind(hospitalAdminController));
router.post('/alerts/:alertId/acknowledge', hospitalAdminController.acknowledgeAlert.bind(hospitalAdminController));

export default router;
