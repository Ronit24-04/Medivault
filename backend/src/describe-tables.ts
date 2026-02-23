import prisma from './config/database';
import * as fs from 'fs';

async function describeTables() {
    try {
        console.log('Describing tables...');
        const adminDesc: any[] = await prisma.$queryRaw`DESCRIBE admin`;
        const hospitalDesc: any[] = await prisma.$queryRaw`DESCRIBE hospital`;

        fs.writeFileSync('table_desc.json', JSON.stringify({
            admin: adminDesc,
            hospital: hospitalDesc
        }, null, 2));

    } catch (error: any) {
        fs.writeFileSync('desc_error.txt', error.stack || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

describeTables();
