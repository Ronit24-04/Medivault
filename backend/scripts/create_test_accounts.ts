import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // 1. Create/Update Hospital Admin
    let hospitalAdmin = await prisma.admin.findUnique({
        where: { email: 'test_hospital@example.com' }
    });

    if (hospitalAdmin) {
        hospitalAdmin = await prisma.admin.update({
            where: { admin_id: hospitalAdmin.admin_id },
            data: { password_hash: passwordHash, account_status: 'active' }
        });
    } else {
        hospitalAdmin = await prisma.admin.create({
            data: {
                email: 'test_hospital@example.com',
                password_hash: passwordHash,
                phone_number: '1234567890',
                user_type: 'hospital',
                account_status: 'active',
                email_verified: true,
            },
        });
    }

    const existingHospital = await prisma.hospital.findFirst({
        where: { admin_id: hospitalAdmin.admin_id }
    });

    if (existingHospital) {
        await prisma.hospital.update({
            where: { hospital_id: existingHospital.hospital_id },
            data: { hospital_name: 'Test City Hospital' }
        });
    } else {
        await prisma.hospital.create({
            data: {
                admin_id: hospitalAdmin.admin_id,
                hospital_name: 'Test City Hospital',
                address: '123 Health St',
                city: 'Testville',
                state: 'Test State',
                phone_number: '1234567890',
                email: 'test_hospital@example.com',
                hospital_type: 'private',
            },
        });
    }

    // 2. Create/Update Patient Admin
    let patientAdmin = await prisma.admin.findUnique({
        where: { email: 'test_patient@example.com' }
    });

    if (patientAdmin) {
        patientAdmin = await prisma.admin.update({
            where: { admin_id: patientAdmin.admin_id },
            data: { password_hash: passwordHash, account_status: 'active' }
        });
    } else {
        patientAdmin = await prisma.admin.create({
            data: {
                email: 'test_patient@example.com',
                password_hash: passwordHash,
                phone_number: '0987654321',
                user_type: 'patient',
                account_status: 'active',
                email_verified: true,
            },
        });
    }

    let patient = await prisma.patient.findFirst({
        where: { admin_id: patientAdmin.admin_id }
    });

    if (patient) {
        patient = await prisma.patient.update({
            where: { patient_id: patient.patient_id },
            data: { full_name: 'John Test Patient' }
        });
    } else {
        patient = await prisma.patient.create({
            data: {
                admin_id: patientAdmin.admin_id,
                full_name: 'John Test Patient',
                date_of_birth: new Date('1990-01-01'),
                gender: 'Male',
                relationship: 'self',
                is_primary: true,
            },
        });
    }

    // 3. Create a medical record for the patient
    await prisma.medicalRecord.create({
        data: {
            patient_id: patient.patient_id,
            title: 'Annual Blood Test',
            category: 'Lab Report',
            file_type: 'application/pdf',
            record_date: new Date(),
            description: 'Test results for annual checkup.',
            file_path: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        }
    });

    console.log('Test accounts and records created successfully.');
    console.log('Hospital: test_hospital@example.com / Password123!');
    console.log('Patient: test_patient@example.com / Password123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
