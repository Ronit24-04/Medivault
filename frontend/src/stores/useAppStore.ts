import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'patient' | 'hospital';
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsOnline: (value: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isOnline: navigator.onLine,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsOnline: (isOnline) => set({ isOnline }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
