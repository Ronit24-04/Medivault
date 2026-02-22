import apiClient, { handleApiError } from '../client';

export interface SharedAccess {
    share_id: number;
    patient_id: number;
    hospital_id?: number;
    contact_id?: number;
    provider_name: string;
    provider_type: string;
    access_level: string;
    shared_on: string;
    expires_on?: string;
    status: string;
    records_accessed_count: number;
    created_at: string;
    updated_at: string;
    hospital?: {
        hospital_id: number;
        hospital_name: string;
        hospital_type: string;
    };
    emergencyContact?: {
        contact_id: number;
        contact_name: string;
        relationship: string;
        phone_number: string;
    };
}

export interface CreateShareRequest {
    hospitalId?: number;
    contactId?: number;
    providerName: string;
    providerType: 'Hospital' | 'Doctor' | 'EmergencyContact';
    accessLevel: string;
    expiresOn?: string;
}

export interface UpdateShareRequest {
    accessLevel?: string;
    expiresOn?: string;
    status?: 'active' | 'expired' | 'revoked';
}

export interface SharedAccessStats {
    activeShares: number;
    totalShares: number;
    totalRecordsAccessed: number;
    pendingRequests: number;
}

class SharedAccessService {
    async getSharedAccess(patientId: number): Promise<SharedAccess[]> {
        try {
            const response = await apiClient.get(`/patients/${patientId}/shared-access`);
            return response.data.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    async createShare(patientId: number, data: CreateShareRequest): Promise<SharedAccess> {
        try {
            const response = await apiClient.post(`/patients/${patientId}/shared-access`, data);
            return response.data.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    async updateShare(patientId: number, shareId: number, data: UpdateShareRequest): Promise<SharedAccess> {
        try {
            const response = await apiClient.put(`/patients/${patientId}/shared-access/${shareId}`, data);
            return response.data.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    async revokeShare(patientId: number, shareId: number): Promise<void> {
        try {
            await apiClient.delete(`/patients/${patientId}/shared-access/${shareId}`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    async getStats(patientId: number): Promise<SharedAccessStats> {
        try {
            const response = await apiClient.get(`/patients/${patientId}/shared-access/stats`);
            return response.data.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }
}

export const sharedAccessService = new SharedAccessService();
