import { Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class AuthController {
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     tags: [Authentication]
     *     summary: Register a new admin account
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - userType
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               phoneNumber:
     *                 type: string
     *               userType:
     *                 type: string
     *                 enum: [patient, hospital]
     *     responses:
     *       201:
     *         description: Registration successful
     */
    async register(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                success: true,
                message: result.message,
                data: result.admin,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     tags: [Authentication]
     *     summary: Login to admin account
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login successful
     */
    async login(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /api/auth/refresh:
     *   post:
     *     tags: [Authentication]
     *     summary: Refresh access token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *     responses:
     *       200:
     *         description: Token refreshed successfully
     */
    async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refreshToken(refreshToken);
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: tokens,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /api/auth/forgot-password:
     *   post:
     *     tags: [Authentication]
     *     summary: Request password reset
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *     responses:
     *       200:
     *         description: Reset email sent if account exists
     */
    async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /api/auth/reset-password:
     *   post:
     *     tags: [Authentication]
     *     summary: Reset password with token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *               - newPassword
     *             properties:
     *               token:
     *                 type: string
     *               newPassword:
     *                 type: string
     *     responses:
     *       200:
     *         description: Password reset successful
     */
    async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { token, newPassword } = req.body;
            const result = await authService.resetPassword(token, newPassword);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /api/auth/setup-emergency-pin:
     *   post:
     *     tags: [Authentication]
     *     summary: Setup emergency PIN
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - pin
     *             properties:
     *               pin:
     *                 type: string
     *     responses:
     *       200:
     *         description: Emergency PIN set successfully
     */
    async setupEmergencyPin(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { pin } = req.body;
            const result = await authService.setupEmergencyPin(req.admin!.adminId, pin);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /api/auth/verify-emergency-pin:
     *   post:
     *     tags: [Authentication]
     *     summary: Verify emergency PIN and get critical info
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - pin
     *             properties:
     *               email:
     *                 type: string
     *               pin:
     *                 type: string
     *     responses:
     *       200:
     *         description: Emergency access granted
     */
    async verifyEmergencyPin(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { email, pin } = req.body;
            const result = await authService.verifyEmergencyPin(email, pin);
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.patients,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /api/auth/profile:
     *   get:
     *     tags: [Authentication]
     *     summary: Get current admin profile
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Profile retrieved successfully
     */
    async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const profile = await authService.getProfile(req.admin!.adminId);
            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
