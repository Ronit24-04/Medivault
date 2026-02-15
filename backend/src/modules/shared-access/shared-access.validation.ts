import { z } from 'zod';

export const createShareSchema = z.object({
    params: z.object({
        patientId: z.string().regex(/^\d+$/, 'Invalid patient ID'),
    }),
    body: z.object({
        hospitalId: z.number().int().optional(),
        contactId: z.number().int().optional(),
        providerName: z.string().max(200).min(1, 'Provider name is required'),
        providerType: z.enum(['Hospital', 'Doctor', 'EmergencyContact']),
        accessLevel: z.string().max(100).min(1, 'Access level is required'),
        expiresOn: z.string().optional(),
    }),
});

export const updateShareSchema = z.object({
    params: z.object({
        patientId: z.string().regex(/^\d+$/, 'Invalid patient ID'),
        shareId: z.string().regex(/^\d+$/, 'Invalid share ID'),
    }),
    body: z.object({
        accessLevel: z.string().max(100).optional(),
        expiresOn: z.string().optional(),
        status: z.enum(['active', 'expired', 'revoked']).optional(),
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
    }),
});
