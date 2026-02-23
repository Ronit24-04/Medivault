import prisma from './config/database';

async function rawTest() {
    try {
        console.log('Running raw SQL tests...');

        const admins: any[] = await prisma.$queryRaw`SELECT * FROM admin WHERE admin_id = 15`;
        console.log('Admin 15:', JSON.stringify(admins));

        const hospitals: any[] = await prisma.$queryRaw`SELECT * FROM hospital`;
        console.log('Hospitals:', JSON.stringify(hospitals));

        const tables: any[] = await prisma.$queryRaw`SHOW TABLES`;
        console.log('Tables:', JSON.stringify(tables));

    } catch (error: any) {
        console.log('RAW_ERROR:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

rawTest();
