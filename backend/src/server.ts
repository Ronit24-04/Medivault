import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import prisma from './config/database';

const PORT = parseInt(env.PORT) || 3000;

const startServer = async () => {
    try {
        // Test atabase connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 MediVault API server running on port ${PORT}`);
            console.log(`📚 API Documentation: ${env.API_URL}/api-docs`);
            console.log(`🏥 Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();
