import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsService, Patient, CreatePatientRequest } from '../api/services';
import { toast } from 'sonner';

// Get all patients
export const usePatients = () => {
    return useQuery({
        queryKey: ['patients'],
        queryFn: () => patientsService.getPatients(),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Get patient by ID
export const usePatient = (patientId: number) => {
    return useQuery({
        queryKey: ['patients', patientId],
        queryFn: () => patientsService.getPatientById(patientId),
        enabled: !!patientId,
    });
};

// Create patient
export const useCreatePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePatientRequest) => patientsService.createPatient(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast.success('Patient created successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create patient');
        },
    });
};

// Update patient
export const useUpdatePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: number; data: Partial<CreatePatientRequest> }) =>
            patientsService.updatePatient(patientId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
            toast.success('Patient updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update patient');
        },
    });
};

// Delete patient
export const useDeletePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (patientId: number) => patientsService.deletePatient(patientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast.success('Patient deleted successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete patient');
        },
    });
};

// Get emergency info
export const useEmergencyInfo = (patientId: number) => {
    return useQuery({
        queryKey: ['patients', patientId, 'emergency-info'],
        queryFn: () => patientsService.getEmergencyInfo(patientId),
        enabled: !!patientId,
    });
};
