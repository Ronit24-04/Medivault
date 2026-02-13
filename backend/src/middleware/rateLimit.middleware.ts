import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window (increased for development)
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
    },
    skipSuccessfulRequests: true,
});

// Emergency PIN rate limiter
export const emergencyPinLimiter = rateLimit({
    windowMs: parseInt(env.EMERGENCY_PIN_WINDOW_MS),
    max: parseInt(env.EMERGENCY_PIN_MAX_ATTEMPTS),
    message: {
        success: false,
        message: 'Too many PIN attempts, please try again later',
    },
    skipSuccessfulRequests: false,
});
