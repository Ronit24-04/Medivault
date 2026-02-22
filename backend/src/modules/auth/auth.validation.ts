import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        phoneNumber: z.string().optional(),
        userType: z.enum(['patient', 'hospital'], {
            errorMap: () => ({ message: 'User type must be either patient or hospital' }),
        }),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
        userType: z
            .enum(['patient', 'hospital'], {
                errorMap: () => ({ message: 'User type must be either patient or hospital' }),
            })
            .optional(),
    }),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
    }),
});

export const setupEmergencyPinSchema = z.object({
    body: z.object({
        pin: z
            .string()
            .length(6, 'PIN must be exactly 6 digits')
            .regex(/^\d{6}$/, 'PIN must contain only numbers'),
    }),
});

export const verifyEmergencyPinSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        pin: z.string().length(6, 'PIN must be exactly 6 digits'),
    }),
});
