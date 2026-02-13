import toast from 'react-hot-toast';

// toast for success
export const showSuccess = (message: string) => {
  toast.success(message, {
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
    },
    iconTheme: {
      primary: 'hsl(var(--success))',
      secondary: 'white',
    },
  });
};

// Toast for error caused
export const showError = (message: string) => {
  toast.error(message, {
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--destructive))',
    },
  });
};

// Toast for loading
export const showLoading = (message: string) => {
  return toast.loading(message, {
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
    },
  });
};

// Toast for dismiss
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// This is a custom toast
export const showToast = (message: string) => {
  toast(message, {
    style: {
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      border: '1px solid hsl(var(--border))',
    },
  });
};

export { toast };
