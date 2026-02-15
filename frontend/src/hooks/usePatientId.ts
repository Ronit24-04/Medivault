import { authService, patientsService } from '@/api/services';
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

                // Fetch all patients for this admin
                const patients = await patientsService.getPatients();

                if (!patients || patients.length === 0) {
                    setError('No patients found');
                    setPatientId(null);
                } else {
                    // Get the primary patient (is_primary = true) or the first patient
                    const primaryPatient = patients.find(p => p.is_primary) || patients[0];
                    setPatientId(primaryPatient.patient_id);
                    setError(null);
                }
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
