import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MediVault API Documentation',
            version: '1.0.0',
            description: 'Digital Medical Records Manager - RESTful API Documentation',
            contact: {
                name: 'MediVault Team',
                email: 'support@medivault.com',
            },
        },
        servers: [
            {
                url: env.API_URL,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'object' } },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            { name: 'Authentication', description: 'Authentication endpoints' },
            { name: 'Admin', description: 'Admin management endpoints' },
            { name: 'Patients', description: 'Patient management endpoints' },
            { name: 'Medical Records', description: 'Medical records management' },
            { name: 'Emergency', description: 'Emergency features and contacts' },
            { name: 'Hospitals', description: 'Hospital directory' },
        ],
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
