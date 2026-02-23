import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTables() {
    try {
        console.log('Listing all tables in the database...');
        const tables: any[] = await prisma.$queryRaw`SHOW TABLES`;
        console.log('Tables found:', tables);

        // Extract table names (MySQL specific)
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('Table names:', tableNames);

        // Check for specific hospital table
        const hasHospital = tableNames.includes('hospital');
        console.log('Has hospital table:', hasHospital);

    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listTables();
