import { PrismaClient } from '@prisma/client';
import { HospitalAdminService } from '../src/modules/hospitals/hospital-admin.service';

const prisma = new PrismaClient();
const hospitalAdminService = new HospitalAdminService();

async function main() {
    await prisma.patient.findFirst({
        where: { full_name: { contains: 'Test' } },
        include: { admin: true }
    });

    const testPatient = await prisma.patient.findFirst({
        where: { full_name: 'John Test Patient' }
    });

    const testHospital = await prisma.hospital.findFirst({
        where: { hospital_name: 'Test City Hospital' },
        include: { admin: true }
    });

    if (!testPatient || !testHospital) {
        console.error('Test accounts not found.');
        return;
    }

    console.log('--- Step 1: Patient shares record with Hospital ---');
    const share = await prisma.sharedAccess.create({
        data: {
            patient_id: testPatient.patient_id,
            hospital_id: testHospital.hospital_id,
            provider_name: testHospital.hospital_name,
            provider_type: 'Hospital',
            access_level: 'Full Records',
            status: 'pending'
        }
    });
    console.log(`Created share request with ID: ${share.share_id}, status: ${share.status}`);

    console.log('--- Step 2: Hospital accepts the request ---');
    const acceptedShare = await hospitalAdminService.acceptShare(testHospital.admin_id, share.share_id);
    console.log(`Accepted share request. New status: ${acceptedShare.status}`);

    console.log('--- Step 3: Hospital retrieves shared files ---');
    const files = await hospitalAdminService.getSharedRecordFiles(testHospital.admin_id, share.share_id);
    console.log(`Retrieved ${files.length} files.`);
    files.forEach(f => console.log(` - ${f.title} (${f.category})`));

    if (acceptedShare.status === 'active' && files.length > 0) {
        console.log('\n✅ SIMULATION SUCCESSFUL: Flow works as expected at the service level.');
    } else {
        console.log('\n❌ SIMULATION FAILED: Unexpected status or file count.');
    }

    // Clean up the test share
    await prisma.sharedAccess.delete({ where: { share_id: share.share_id } });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
