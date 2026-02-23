import apiClient, { handleApiError } from '../client';
import { ApiResponse, Patient, CreatePatientRequest } from '../types';

export const patientsService = {
    // Create new patient
    async createPatient(data: CreatePatientRequest): Promise<Patient> {
        try {
            const response = await apiClient.post<ApiResponse<Patient>>('/patients', data);
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get all patients
    async getPatients(): Promise<Patient[]> {
        try {
            const response = await apiClient.get<ApiResponse<Patient[]>>('/patients');
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get patient by ID
    async getPatientById(patientId: number): Promise<Patient> {
        try {
            const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${patientId}`);
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Update patient
    async updatePatient(patientId: number, data: Partial<CreatePatientRequest>): Promise<Patient> {
        try {
            const response = await apiClient.put<ApiResponse<Patient>>(`/patients/${patientId}`, data);
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Delete patient
    async deletePatient(patientId: number): Promise<void> {
        try {
            await apiClient.delete(`/patients/${patientId}`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get emergency info
    async getEmergencyInfo(patientId: number): Promise<any> {
        try {
            const response = await apiClient.get<ApiResponse>(`/patients/${patientId}/emergency-info`);
            return response.data.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Send emergency alert SMS to patient's contacts
    async sendEmergencyAlert(
        patientId: number,
        location?: { latitude?: number; longitude?: number }
    ): Promise<void> {
        try {
            await apiClient.post(`/emergency-alerts/${patientId}/send-alert`, location || {});
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async verifyProfilePin(patientId: number, pin: string): Promise<void> {
        try {
            await apiClient.post(`/patients/${patientId}/verify-pin`, { pin });
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Send emergency alert without login using patient account email
    async sendEmergencyAlertByEmail(
        email: string,
        location?: { latitude?: number; longitude?: number }
    ): Promise<any> {
        try {
            const response = await apiClient.post<ApiResponse>('/emergency-alerts/public/send-alert', {
                email,
                ...(location || {}),
            });
            return response.data.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get public emergency info by email
    async getPublicEmergencyInfo(email: string): Promise<any> {
        try {
            const response = await apiClient.get<ApiResponse>(`/patients/public/emergency-info?email=${encodeURIComponent(email)}`);
            return response.data.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
