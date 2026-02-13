import { useQuery } from '@tanstack/react-query';
import { hospitalsService, Hospital, HospitalFilters } from '../api/services';

// Search hospitals
export const useHospitals = (filters?: HospitalFilters) => {
    return useQuery({
        queryKey: ['hospitals', filters],
        queryFn: () => hospitalsService.searchHospitals(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Get hospital by ID
export const useHospital = (hospitalId: number) => {
    return useQuery({
        queryKey: ['hospitals', hospitalId],
        queryFn: () => hospitalsService.getHospitalById(hospitalId),
        enabled: !!hospitalId,
    });
};

// Get nearby hospitals
export const useNearbyHospitals = (latitude?: number, longitude?: number, radius: number = 50) => {
    return useQuery({
        queryKey: ['hospitals', 'nearby', latitude, longitude, radius],
        queryFn: () => hospitalsService.getNearbyHospitals(latitude!, longitude!, radius),
        enabled: !!latitude && !!longitude,
    });
};
