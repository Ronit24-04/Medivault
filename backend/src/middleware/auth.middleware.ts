import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt.util';

export interface AuthRequest extends Request {
    admin?: JWTPayload;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided',
            });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);

        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};

export const optionalAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyAccessToken(token);
            req.admin = decoded;
        }

        next();
    } catch (error) {
        next();
    }
};
