import { z } from 'zod';

export const createContactSchema = z.object({
    body: z.object({
        patientId: z.number().int().positive(),
        name: z.string().min(1, 'Name is required'),
        relationship: z.string().min(1, 'Relationship is required'),
        phoneNumber: z.string().min(10, 'Valid phone number is required'),
        email: z.string().email().optional(),
        priority: z.number().int().positive().optional(),
    }),
});

export const updateContactSchema = z.object({
    params: z.object({
        contactId: z.string().regex(/^\d+$/, 'Invalid contact ID'),
    }),
    body: z.object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().email().optional(),
        priority: z.number().int().positive().optional(),
    }),
});

export const createAlertSchema = z.object({
    body: z.object({
        patientId: z.number().int().positive(),
        hospitalId: z.number().int().positive().optional(),
        patientLocation: z.string().optional(),
        criticalSummary: z.string().optional(),
        alertMessage: z.string().min(1, 'Alert message is required'),
    }),
});
