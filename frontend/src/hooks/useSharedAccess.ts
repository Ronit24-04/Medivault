import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    sharedAccessService,
    SharedAccess,
    CreateShareRequest,
    UpdateShareRequest,
    SharedAccessStats,
} from '../api/services';
import { toast } from 'sonner';

const sharedAccessKeys = {
    all: (patientId: number) => ['sharedAccess', patientId] as const,
    stats: (patientId: number) => ['sharedAccessStats', patientId] as const,
    files: (patientId: number, shareId: number | null) => ['sharedAccess', patientId, 'files', shareId] as const,
};

// Get shared access for a patient
export const useSharedAccess = (patientId: number) => {
    return useQuery({
        queryKey: sharedAccessKeys.all(patientId),
        queryFn: () => sharedAccessService.getSharedAccess(patientId),
        enabled: !!patientId,
    });
};

// Get shared access statistics
export const useSharedAccessStats = (patientId: number) => {
    return useQuery({
        queryKey: sharedAccessKeys.stats(patientId),
        queryFn: () => sharedAccessService.getStats(patientId),
        enabled: !!patientId,
    });
};

// Create new share
export const useCreateShare = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: number; data: CreateShareRequest }) =>
            sharedAccessService.createShare(patientId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: sharedAccessKeys.all(variables.patientId) });
            queryClient.invalidateQueries({ queryKey: sharedAccessKeys.stats(variables.patientId) });
            toast.success('Access granted successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to grant access');
        },
    });
};

// Update share
export const useUpdateShare = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            patientId,
            shareId,
            data,
        }: {
            patientId: number;
            shareId: number;
            data: UpdateShareRequest;
        }) => sharedAccessService.updateShare(patientId, shareId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: sharedAccessKeys.all(variables.patientId) });
            queryClient.invalidateQueries({ queryKey: sharedAccessKeys.stats(variables.patientId) });
            toast.success('Access updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update access');
        },
    });
};

// Revoke share
export const useRevokeShare = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, shareId }: { patientId: number; shareId: number }) =>
            sharedAccessService.revokeShare(patientId, shareId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: sharedAccessKeys.all(variables.patientId) });
            queryClient.invalidateQueries({ queryKey: sharedAccessKeys.stats(variables.patientId) });
            toast.success('Access revoked successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to revoke access');
        },
    });
};

export const useSharedFiles = (patientId: number, shareId: number | null) => {
    return useQuery({
        queryKey: sharedAccessKeys.files(patientId, shareId),
        queryFn: () => sharedAccessService.getSharedFiles(patientId, shareId!),
        enabled: !!patientId && !!shareId,
    });
};
