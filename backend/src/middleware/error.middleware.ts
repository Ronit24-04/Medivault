import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', err);

    // Handle custom AppError
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            res.status(409).json({
                success: false,
                message: 'A record with this value already exists',
            });
            return;
        }

        if (err.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: 'Record not found',
            });
            return;
        }
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            message: 'Token expired',
        });
        return;
    }

    // Default error
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
};

export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};
