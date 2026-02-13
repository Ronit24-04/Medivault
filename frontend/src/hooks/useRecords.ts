import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsService, MedicalRecord, UploadRecordRequest, RecordFilters } from '../api/services';
import { toast } from 'sonner';

// Get records for a patient
export const useRecords = (patientId: number, filters?: RecordFilters) => {
    return useQuery({
        queryKey: ['records', patientId, filters],
        queryFn: () => recordsService.getRecords(patientId, filters),
        enabled: !!patientId,
    });
};

// Get timeline
export const useTimeline = (patientId: number) => {
    return useQuery({
        queryKey: ['timeline', patientId],
        queryFn: () => recordsService.getTimeline(patientId),
        enabled: !!patientId,
    });
};

// Get record by ID
export const useRecord = (patientId: number, recordId: number) => {
    return useQuery({
        queryKey: ['records', patientId, recordId],
        queryFn: () => recordsService.getRecordById(patientId, recordId),
        enabled: !!patientId && !!recordId,
    });
};

// Upload record
export const useUploadRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: number; data: UploadRecordRequest }) =>
            recordsService.uploadRecord(patientId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['records', variables.patientId] });
            queryClient.invalidateQueries({ queryKey: ['timeline', variables.patientId] });
            toast.success('Record uploaded successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to upload record');
        },
    });
};

// Update record
export const useUpdateRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            patientId,
            recordId,
            data,
        }: {
            patientId: number;
            recordId: number;
            data: Partial<Omit<UploadRecordRequest, 'file'>>;
        }) => recordsService.updateRecord(patientId, recordId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['records', variables.patientId] });
            queryClient.invalidateQueries({ queryKey: ['records', variables.patientId, variables.recordId] });
            toast.success('Record updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update record');
        },
    });
};

// Delete record
export const useDeleteRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, recordId }: { patientId: number; recordId: number }) =>
            recordsService.deleteRecord(patientId, recordId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['records', variables.patientId] });
            toast.success('Record deleted successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete record');
        },
    });
};
