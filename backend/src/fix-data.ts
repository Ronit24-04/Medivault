import prisma from './config/database';

async function fixData() {
    try {
        console.log('Checking for invalid hospital_type values...');

        // 1. Get ALL hospital records using raw SQL to see what's actually there
        const hospitals: any[] = await prisma.$queryRaw`SELECT * FROM hospital`;
        console.log('Hospitals in DB:', JSON.stringify(hospitals, null, 2));

        // 2. Update any invalid values to 'private'
        console.log('Updating invalid values...');
        // We use queryRaw for the fix too since Prisma Client might crash if we try to use it with invalid data
        const result = await prisma.$executeRaw`
            UPDATE hospital 
            SET hospital_type = 'private' 
            WHERE hospital_type NOT IN ('clinic', 'government', 'private', 'specialty') 
               OR hospital_type IS NULL 
               OR hospital_type = ''
        `;
        console.log(`Updated ${result} rows.`);

        // 3. Verify total count again through Prisma
        const count = await prisma.hospital.count();
        console.log('Final hospital count via Prisma:', count);

    } catch (error: any) {
        console.error('Fix failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixData();
