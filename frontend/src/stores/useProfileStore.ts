import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient } from '@/api/types';
import { patientsService } from '@/api/services';

interface ProfileState {
    profiles: Patient[];
    currentProfile: Patient | null;
    isLoading: boolean;
    error: string | null;

    setProfiles: (profiles: Patient[]) => void;
    setCurrentProfile: (profile: Patient) => void;
    switchProfile: (patientId: number) => void;
    addProfile: (profile: Patient) => void;
    removeProfile: (patientId: number) => void;
    loadProfiles: () => Promise<void>;
    clearProfiles: () => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            profiles: [],
            currentProfile: null,
            isLoading: false,
            error: null,

            setProfiles: (profiles) => {
                set({ profiles });
                const current = get().currentProfile;
                if (current) {
                    // Refresh the currentProfile from the fresh API data to keep it in sync
                    const refreshed = profiles.find((p) => p.patient_id === current.patient_id);
                    if (refreshed) {
                        set({ currentProfile: refreshed });
                    } else if (profiles.length > 0) {
                        // Profile no longer exists, fall back to primary
                        const primary = profiles.find((p) => p.is_primary) || profiles[0];
                        set({ currentProfile: primary });
                    }
                } else if (profiles.length > 0) {
                    // No profile selected yet, pick the primary
                    const primary = profiles.find((p) => p.is_primary) || profiles[0];
                    set({ currentProfile: primary });
                }
            },

            setCurrentProfile: (profile) => {
                set({ currentProfile: profile });
            },

            switchProfile: (patientId) => {
                const profile = get().profiles.find((p) => p.patient_id === patientId);
                if (profile) {
                    set({ currentProfile: profile });
                }
            },

            addProfile: (profile) => {
                set((state) => ({
                    profiles: [...state.profiles, profile],
                }));
            },

            removeProfile: (patientId) => {
                set((state) => {
                    const updatedProfiles = state.profiles.filter(
                        (p) => p.patient_id !== patientId
                    );
                    const newCurrent =
                        state.currentProfile?.patient_id === patientId
                            ? updatedProfiles.find((p) => p.is_primary) || updatedProfiles[0] || null
                            : state.currentProfile;

                    return {
                        profiles: updatedProfiles,
                        currentProfile: newCurrent,
                    };
                });
            },

            loadProfiles: async () => {
                set({ isLoading: true, error: null });
                try {
                    const profiles = await patientsService.getPatients();
                    get().setProfiles(profiles);
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to load profiles',
                        profiles: [],
                        currentProfile: null,
                    });
                } finally {
                    set({ isLoading: false });
                }
            },

            clearProfiles: () => {
                set({
                    profiles: [],
                    currentProfile: null,
                    error: null,
                });
            },
        }),
        {
            name: 'profile-storage',
            partialize: (state) => ({
                currentProfile: state.currentProfile || null,
            }),
        }
    )
);
