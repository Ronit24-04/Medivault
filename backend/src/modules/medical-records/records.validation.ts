import { z } from 'zod';

export const uploadRecordSchema = z.object({
    params: z.object({
        patientId: z.string().regex(/^\d+$/, 'Invalid patient ID'),
    }),
    body: z.object({
        recordType: z.string().min(1, 'Record type is required'),
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        recordDate: z.string().min(1, 'Record date is required'),
        doctorName: z.string().optional(),
        hospitalName: z.string().optional(),
        medicalCondition: z.string().optional(),
        isCritical: z.boolean().optional(),
        tags: z.string().optional(),
    }),
});

export const getRecordsSchema = z.object({
    params: z.object({
        patientId: z.string().regex(/^\d+$/, 'Invalid patient ID'),
    }),
    query: z.object({
        recordType: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        doctorName: z.string().optional(),
        hospitalName: z.string().optional(),
        medicalCondition: z.string().optional(),
        isCritical: z.string().optional(),
        search: z.string().optional(),
    }),
});

export const recordIdSchema = z.object({
    params: z.object({
        patientId: z.string().regex(/^\d+$/, 'Invalid patient ID'),
        recordId: z.string().regex(/^\d+$/, 'Invalid record ID'),
    }),
});

export const updateRecordSchema = z.object({
    params: z.object({
        patientId: z.string().regex(/^\d+$/, 'Invalid patient ID'),
        recordId: z.string().regex(/^\d+$/, 'Invalid record ID'),
    }),
    body: z.object({
        recordType: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        recordDate: z.string().optional(),
        doctorName: z.string().optional(),
        hospitalName: z.string().optional(),
        medicalCondition: z.string().optional(),
        isCritical: z.boolean().optional(),
        tags: z.string().optional(),
    }),
});
