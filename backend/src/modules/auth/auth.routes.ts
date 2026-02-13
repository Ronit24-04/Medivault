import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter, emergencyPinLimiter } from '../../middleware/rateLimit.middleware';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    setupEmergencyPinSchema,
    verifyEmergencyPinSchema,
} from './auth.validation';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register.bind(authController));
router.post('/login', authLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken.bind(authController));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));

// Emergency PIN (public but rate limited)
router.post('/verify-emergency-pin', emergencyPinLimiter, validate(verifyEmergencyPinSchema), authController.verifyEmergencyPin.bind(authController));

// Protected routes
router.post('/setup-emergency-pin', authenticate, validate(setupEmergencyPinSchema), authController.setupEmergencyPin.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router;
