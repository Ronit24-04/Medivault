import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hospitalAdminService, UpdateHospitalProfileRequest } from '../api/services/hospital-admin.service';
import { toast } from 'sonner';

export const useHospitalProfile = () => {
    return useQuery({
        queryKey: ['hospital-profile'],
        queryFn: () => hospitalAdminService.getProfile(),
        staleTime: 0,
    });
};

export const useUpdateHospitalProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateHospitalProfileRequest) => hospitalAdminService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hospital-profile'] });
            toast.success('Settings saved successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save settings');
        },
    });
};

export const useHospitalSharedRecords = () => {
    return useQuery({
        queryKey: ['hospital-shared-records'],
        queryFn: () => hospitalAdminService.getSharedRecords(),
        staleTime: 2 * 60 * 1000,
    });
};

export const useHospitalAlerts = () => {
    return useQuery({
        queryKey: ['hospital-alerts'],
        queryFn: () => hospitalAdminService.getAlerts(),
        staleTime: 1 * 60 * 1000,
    });
};

export const useAcknowledgeHospitalAlert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alertId: number) => hospitalAdminService.acknowledgeAlert(alertId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hospital-alerts'] });
            toast.success('Alert acknowledged!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to acknowledge alert');
        },
    });
};
