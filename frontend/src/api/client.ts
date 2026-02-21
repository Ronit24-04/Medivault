import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Try to refresh the token
                const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
                    `${API_URL}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data.data!;

                // Store new tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Retry original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (axios.isAxiosError(error)) {
        const apiError = error as AxiosError<ApiResponse>;

        if (apiError.response?.data?.message) {
            return apiError.response.data.message;
        }

        if (apiError.response?.data?.errors) {
            return apiError.response.data.errors.map(e => e.message).join(', ');
        }

        if (apiError.message) {
            return apiError.message;
        }
    }

    return 'An unexpected error occurred';
};
