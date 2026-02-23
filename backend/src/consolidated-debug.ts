import prisma from './config/database';
import * as fs from 'fs';

async function consolidatedDebug() {
    const results: any = {};
    try {
        console.log('Running consolidated debug...');

        // 1. Admin record
        results.admin15 = await prisma.$queryRaw`SELECT * FROM admin WHERE admin_id = 15`;

        // 2. Table list
        results.tables = await prisma.$queryRaw`SHOW TABLES`;

        // 3. Create statements
        results.adminCreate = await prisma.$queryRaw`SHOW CREATE TABLE admin`;
        results.hospitalCreate = await prisma.$queryRaw`SHOW CREATE TABLE hospital`;

        // 4. Prisma count
        try {
            results.hospitalCount = await prisma.hospital.count();
        } catch (e: any) {
            results.hospitalCountError = { message: e.message, stack: e.stack };
        }

        fs.writeFileSync('consolidated_debug.json', JSON.stringify(results, null, 2));
        console.log('Results written to consolidated_debug.json');

    } catch (error: any) {
        fs.writeFileSync('consolidated_error.txt', error.stack || error.message);
        console.error('Debug failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

consolidatedDebug();
