import apiClient, { handleApiError } from '../client';
import { ApiResponse, Hospital } from '../types';

export interface HospitalSharedRecord {
    share_id: number;
    patient_id: number;
    provider_name: string;
    provider_type: string;
    access_level: string;
    shared_on: string;
    expires_on?: string;
    status: string;
    records_accessed_count: number;
    patient: {
        patient_id: number;
        full_name: string;
        date_of_birth?: string;
        gender?: string;
    };
}

export type SharedRecordDecision = 'acknowledged' | 'rejected';

export interface HospitalAlert {
    alert_id: number;
    patient_id: number;
    hospital_id?: number;
    patient_location?: string;
    critical_summary?: string;
    alert_message?: string;
    status: string;
    sent_to_hospital: boolean;
    sent_at?: string;
    acknowledged_at?: string;
    patient: {
        patient_id: number;
        full_name: string;
    };
}

export interface SharedRecordFile {
    record_id: number;
    title: string;
    category: string;
    record_date: string;
    file_path: string;
    file_type: string;
    description?: string;
}

export interface UpdateHospitalProfileRequest {
    hospitalName?: string;
    address?: string;
    city?: string;
    state?: string;
    phoneNumber?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
}

export const hospitalAdminService = {
    async getProfile(): Promise<Hospital | null> {
        try {
            const response = await apiClient.get<ApiResponse<Hospital | null>>('/hospital/profile');
            return response.data.data ?? null;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async updateProfile(data: UpdateHospitalProfileRequest): Promise<Hospital> {
        try {
            const response = await apiClient.put<ApiResponse<Hospital>>('/hospital/profile', data);
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async getSharedRecords(): Promise<HospitalSharedRecord[]> {
        try {
            const response = await apiClient.get<ApiResponse<HospitalSharedRecord[]>>('/hospital/shared-records');
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async updateSharedRecordStatus(
        shareId: number,
        status: SharedRecordDecision
    ): Promise<HospitalSharedRecord> {
        try {
            const response = await apiClient.post<ApiResponse<HospitalSharedRecord>>(
                `/hospital/shared-records/${shareId}/status`,
                { status }
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async getSharedRecordFiles(shareId: number): Promise<SharedRecordFile[]> {
        try {
            const response = await apiClient.get<ApiResponse<SharedRecordFile[]>>(
                `/hospital/shared-records/${shareId}/files`
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async getAlerts(): Promise<HospitalAlert[]> {
        try {
            const response = await apiClient.get<ApiResponse<HospitalAlert[]>>('/hospital/alerts');
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    async acknowledgeAlert(alertId: number): Promise<HospitalAlert> {
        try {
            const response = await apiClient.post<ApiResponse<HospitalAlert>>(`/hospital/alerts/${alertId}/acknowledge`);
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
