import { z } from 'zod';

export const createPatientSchema = z.object({
    body: z.object({
        fullName: z.string().min(1, 'Full name is required'),
        address: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        bloodType: z.string().optional(),
        height: z.number().positive().optional(),
        weight: z.number().positive().optional(),
        allergies: z.string().optional(),
        chronicConditions: z.string().optional(),
        currentMedications: z.string().optional(),
        relationship: z.string().min(1, 'Relationship is required'),
        isPrimary: z.boolean().optional(),
    }),
});

export const updatePatientSchema = z.object({
    params: z.object({
        patientId: z.string().regex(/^\d+$/, 'Invalid patient ID'),
    }),
    body: z.object({
        fullName: z.string().min(1).optional(),
        address: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        bloodType: z.string().optional(),
        height: z.number().positive().optional(),
        weight: z.number().positive().optional(),
        allergies: z.string().optional(),
        chronicConditions: z.string().optional(),
        currentMedications: z.string().optional(),
        relationship: z.string().optional(),
        isPrimary: z.boolean().optional(),
        emergencyPin: z
            .string()
            .regex(/^\d{4}$/, 'Emergency PIN must be exactly 4 digits')
            .optional(),
    }),
});

export const patientIdSchema = z.object({
    params: z.object({
        patientId: z.string().regex(/^\d+$/, 'Invalid patient ID'),
    }),
});

export const verifyPatientPinSchema = z.object({
    params: z.object({
        patientId: z.string().regex(/^\d+$/, 'Invalid patient ID'),
    }),
    body: z.object({
        pin: z
            .string()
            .regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
    }),
});
