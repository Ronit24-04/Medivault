import apiClient, { handleApiError } from '../client';
import { ApiResponse, Hospital, HospitalFilters } from '../types';

export const hospitalsService = {
    // Search hospitals
    async searchHospitals(filters?: HospitalFilters): Promise<Hospital[]> {
        try {
            const response = await apiClient.get<ApiResponse<Hospital[]>>('/hospitals', {
                params: filters,
            });
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get hospital by ID
    async getHospitalById(hospitalId: number): Promise<Hospital> {
        try {
            const response = await apiClient.get<ApiResponse<Hospital>>(`/hospitals/${hospitalId}`);
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get nearby hospitals using geolocation
    async getNearbyHospitals(latitude: number, longitude: number, radius: number = 50): Promise<Hospital[]> {
        try {
            const response = await apiClient.get<ApiResponse<Hospital[]>>('/hospitals', {
                params: {
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    radius: radius.toString(),
                },
            });
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },
};
