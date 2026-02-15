import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFound } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { env } from './config/env';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import patientsRoutes from './modules/patients/patients.routes';
import recordsRoutes from './modules/medical-records/records.routes';
import emergencyRoutes from './modules/emergency/emergency.routes';
import hospitalsRoutes from './modules/hospitals/hospitals.routes';
import sharedAccessRoutes from './modules/shared-access/shared-access.routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'MediVault API is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/patients', recordsRoutes);
app.use('/api/patients', sharedAccessRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/hospitals', hospitalsRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
