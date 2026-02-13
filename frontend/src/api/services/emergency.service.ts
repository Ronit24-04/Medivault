import apiClient, { handleApiError } from '../client';
import {
    ApiResponse,
    EmergencyContact,
    CreateContactRequest,
    EmergencyAlert,
    CreateAlertRequest,
} from '../types';

export const emergencyService = {
    // Emergency Contacts
    async createContact(data: CreateContactRequest): Promise<EmergencyContact> {
        try {
            const response = await apiClient.post<ApiResponse<EmergencyContact>>(
                '/emergency/contacts',
                data
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async getContacts(): Promise<EmergencyContact[]> {
        try {
            const response = await apiClient.get<ApiResponse<EmergencyContact[]>>('/emergency/contacts');
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async updateContact(
        contactId: number,
        data: Partial<CreateContactRequest>
    ): Promise<EmergencyContact> {
        try {
            const response = await apiClient.put<ApiResponse<EmergencyContact>>(
                `/emergency/contacts/${contactId}`,
                data
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async deleteContact(contactId: number): Promise<void> {
        try {
            await apiClient.delete(`/emergency/contacts/${contactId}`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Emergency Alerts
    async createAlert(data: CreateAlertRequest): Promise<EmergencyAlert> {
        try {
            const response = await apiClient.post<ApiResponse<EmergencyAlert>>(
                '/emergency/alerts',
                data
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async getAlerts(): Promise<EmergencyAlert[]> {
        try {
            const response = await apiClient.get<ApiResponse<EmergencyAlert[]>>('/emergency/alerts');
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async acknowledgeAlert(alertId: number): Promise<EmergencyAlert> {
        try {
            const response = await apiClient.post<ApiResponse<EmergencyAlert>>(
                `/emergency/alerts/${alertId}/acknowledge`
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
