import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    try {
        console.log('Verifying hospital table existence and content...');
        const count = await prisma.hospital.count();
        console.log('Hospital table count:', count);

        const tables: any[] = await prisma.$queryRaw`SHOW TABLES`;
        console.log('Full table list:', JSON.stringify(tables));

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
