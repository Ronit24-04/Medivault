import { Router } from 'express';
import { hospitalsController } from './hospitals.controller';
import { optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

// Public routes (optional auth for better experience)
router.get('/', optionalAuth, hospitalsController.getHospitals.bind(hospitalsController));
router.get('/:hospitalId', optionalAuth, hospitalsController.getHospitalById.bind(hospitalsController));

export default router;
