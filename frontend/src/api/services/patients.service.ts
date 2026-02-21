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
    async sendEmergencyAlert(patientId: number): Promise<void> {
        try {
            await apiClient.post(`/patients/${patientId}/send-alert`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
