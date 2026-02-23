import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { authService, LoginRequest, RegisterRequest, AdminProfile } from '../api/services';
import { toast } from 'sonner';

// Login hook
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginRequest) => authService.login(data),
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], data.admin);
            toast.success('Login successful!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Login failed');
        },
    });
};

// Register hook
export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
        onSuccess: () => {
            toast.success('Registration successful! Please check your email to verify your account.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Registration failed');
        },
    });
};

// Get profile hook
export const useProfile = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => authService.getProfile(),
        enabled: authService.isAuthenticated(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Setup emergency PIN
export const useSetupEmergencyPin = () => {
    return useMutation({
        mutationFn: (pin: string) => authService.setupEmergencyPin(pin),
        onSuccess: () => {
            toast.success('Emergency PIN set successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to set emergency PIN');
        },
    });
};

// Verify emergency PIN
export const useVerifyEmergencyPin = () => {
    return useMutation({
        mutationFn: ({ email, pin }: { email: string; pin: string }) =>
            authService.verifyEmergencyPin(email, pin),
        onSuccess: () => {
            toast.success('Emergency access granted!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Invalid PIN');
        },
    });
};

// Forgot password
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (email: string) => authService.forgotPassword(email),
        onSuccess: () => {
            toast.success('Password reset link sent to your email!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to send reset link');
        },
    });
};

// Reset password
export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
            authService.resetPassword(token, newPassword),
        onSuccess: () => {
            toast.success('Password reset successful!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reset password');
        },
    });
};

// Logout
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useCallback(() => {
        authService.logout();
        queryClient.clear();
        toast.success('Logged out successfully');
    }, [queryClient]);
};
