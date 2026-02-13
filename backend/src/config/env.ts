import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    API_URL: z.string().url(),
    FRONTEND_URL: z.string().url(),

    DATABASE_URL: z.string(),

    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),

    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.string(),
    EMAIL_SECURE: z.string().transform(val => val === 'true'),
    EMAIL_USER: z.string().email(),
    EMAIL_PASSWORD: z.string(),
    EMAIL_FROM: z.string(),

    RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

    EMERGENCY_PIN_MAX_ATTEMPTS: z.string().default('5'),
    EMERGENCY_PIN_WINDOW_MS: z.string().default('900000'),

    MAX_FILE_SIZE: z.string().default('10485760'),
    ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/jpg,application/pdf'),

    QR_CODE_SIZE: z.string().default('300'),
    QR_CODE_ERROR_CORRECTION: z.enum(['L', 'M', 'Q', 'H']).default('M'),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
            throw new Error(`Missing or invalid environment variables: ${missingVars}`);
        }
        throw error;
    }
};

export const env = validateEnv();
