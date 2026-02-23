import prisma from './config/database';
import * as fs from 'fs';

async function showCreate() {
    try {
        console.log('Fetching table creation statements...');
        const adminCreate: any[] = await prisma.$queryRaw`SHOW CREATE TABLE admin`;
        const hospitalCreate: any[] = await prisma.$queryRaw`SHOW CREATE TABLE hospital`;

        fs.writeFileSync('table_create.json', JSON.stringify({
            admin: adminCreate,
            hospital: hospitalCreate
        }, null, 2));

    } catch (error: any) {
        fs.writeFileSync('create_error.txt', error.stack || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

showCreate();
