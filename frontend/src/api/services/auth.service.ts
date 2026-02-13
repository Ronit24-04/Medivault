import apiClient, { handleApiError } from '../client';
import {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    AdminProfile,
} from '../types';

export const authService = {
    // Register new account
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Login
    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
            const authData = response.data.data!;

            // Store tokens and user data
            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);
            localStorage.setItem('user', JSON.stringify(authData.admin));

            return authData;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Logout
    logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    // Get current user profile
    async getProfile(): Promise<AdminProfile> {
        try {
            const response = await apiClient.get<ApiResponse<AdminProfile>>('/auth/profile');
            return response.data.data!;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Setup emergency PIN
    async setupEmergencyPin(pin: string): Promise<void> {
        try {
            await apiClient.post('/auth/setup-emergency-pin', { pin });
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Verify emergency PIN
    async verifyEmergencyPin(email: string, pin: string): Promise<any> {
        try {
            const response = await apiClient.post<ApiResponse>('/auth/verify-emergency-pin', {
                email,
                pin,
            });
            return response.data.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Forgot password
    async forgotPassword(email: string): Promise<void> {
        try {
            await apiClient.post('/auth/forgot-password', { email });
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Reset password
    async resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            await apiClient.post('/auth/reset-password', { token, newPassword });
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
    },

    // Get stored user data
    getStoredUser(): AdminProfile | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
};
