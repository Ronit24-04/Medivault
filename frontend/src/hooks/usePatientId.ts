import { authService } from '@/api/services';
import { useState, useEffect } from 'react';

/**
 * Custom hook to get the primary patient ID for the current logged-in user
 * Returns the patient ID to use for API calls
 */
export const usePatientId = () => {
    const [patientId, setPatientId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatientId = async () => {
            try {
                setIsLoading(true);
                const user = authService.getStoredUser();

                if (!user) {
                    setError('No user logged in');
                    setIsLoading(false);
                    return;
                }

                // For now, we'll use a placeholder patient ID
                // In a real implementation, you would fetch the primary patient for this admin
                // This could be done via a new API endpoint or stored in the user profile
                setPatientId(1); // Placeholder - should be fetched from API
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to get patient ID');
                setPatientId(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientId();
    }, []);

    return { patientId, isLoading, error };
};
