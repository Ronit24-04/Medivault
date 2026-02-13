import apiClient, { handleApiError } from '../client';
import { ApiResponse, MedicalRecord, UploadRecordRequest, RecordFilters } from '../types';

export const recordsService = {
    // Upload medical record
    async uploadRecord(patientId: number, data: UploadRecordRequest): Promise<MedicalRecord> {
        try {
            const formData = new FormData();
            formData.append('file', data.file);
            formData.append('recordType', data.recordType);
            formData.append('title', data.title);
            formData.append('recordDate', data.recordDate);

            if (data.description) formData.append('description', data.description);
            if (data.doctorName) formData.append('doctorName', data.doctorName);
            if (data.hospitalName) formData.append('hospitalName', data.hospitalName);
            if (data.medicalCondition) formData.append('medicalCondition', data.medicalCondition);
            if (data.isCritical !== undefined) formData.append('isCritical', String(data.isCritical));
            if (data.tags) formData.append('tags', data.tags);

            const response = await apiClient.post<ApiResponse<MedicalRecord>>(
                `/patients/${patientId}/records`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get all records for a patient
    async getRecords(patientId: number, filters?: RecordFilters): Promise<MedicalRecord[]> {
        try {
            const response = await apiClient.get<ApiResponse<MedicalRecord[]>>(
                `/patients/${patientId}/records`,
                { params: filters }
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get timeline view
    async getTimeline(patientId: number): Promise<any[]> {
        try {
            const response = await apiClient.get<ApiResponse<any[]>>(
                `/patients/${patientId}/records/timeline`
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get record by ID
    async getRecordById(patientId: number, recordId: number): Promise<MedicalRecord> {
        try {
            const response = await apiClient.get<ApiResponse<MedicalRecord>>(
                `/patients/${patientId}/records/${recordId}`
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Update record
    async updateRecord(
        patientId: number,
        recordId: number,
        data: Partial<Omit<UploadRecordRequest, 'file'>>
    ): Promise<MedicalRecord> {
        try {
            const response = await apiClient.put<ApiResponse<MedicalRecord>>(
                `/patients/${patientId}/records/${recordId}`,
                data
            );
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Delete record
    async deleteRecord(patientId: number, recordId: number): Promise<void> {
        try {
            await apiClient.delete(`/patients/${patientId}/records/${recordId}`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
