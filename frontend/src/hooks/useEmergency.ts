import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    emergencyService,
    EmergencyContact,
    CreateContactRequest,
    EmergencyAlert,
    CreateAlertRequest,
} from '../api/services';
import { toast } from 'sonner';

// Emergency Contacts
export const useEmergencyContacts = () => {
    return useQuery({
        queryKey: ['emergency-contacts'],
        queryFn: () => emergencyService.getContacts(),
    });
};

export const useCreateContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateContactRequest) => emergencyService.createContact(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
            toast.success('Emergency contact added!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add contact');
        },
    });
};

export const useUpdateContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contactId, data }: { contactId: number; data: Partial<CreateContactRequest> }) =>
            emergencyService.updateContact(contactId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
            toast.success('Contact updated!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update contact');
        },
    });
};

export const useDeleteContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contactId: number) => emergencyService.deleteContact(contactId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
            toast.success('Contact deleted!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete contact');
        },
    });
};

// Emergency Alerts
export const useEmergencyAlerts = () => {
    return useQuery({
        queryKey: ['emergency-alerts'],
        queryFn: () => emergencyService.getAlerts(),
    });
};

export const useCreateAlert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAlertRequest) => emergencyService.createAlert(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
            toast.success('Emergency alert sent!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to send alert');
        },
    });
};

export const useAcknowledgeAlert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (alertId: number) => emergencyService.acknowledgeAlert(alertId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
            toast.success('Alert acknowledged!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to acknowledge alert');
        },
    });
};
