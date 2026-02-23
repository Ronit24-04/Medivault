import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing getHospitalByAdminId fallback logic...');
        // Test admin ID 15 (from admins.json)
        const adminId = 15;

        const hospitalByAdmin = await prisma.hospital.findFirst({
            where: { admin_id: adminId },
        });
        console.log('Hospital by Admin ID:', hospitalByAdmin);

        if (!hospitalByAdmin) {
            const admin = await prisma.admin.findUnique({
                where: { admin_id: adminId },
                select: { email: true },
            });
            console.log('Admin email:', admin?.email);

            if (admin?.email) {
                const hospitalByEmail = await prisma.hospital.findFirst({
                    where: { email: admin.email },
                });
                console.log('Hospital by Email:', hospitalByEmail);

                if (hospitalByEmail) {
                    console.log('Attempting to update hospital with admin_id...');
                    const updated = await prisma.hospital.update({
                        where: { hospital_id: hospitalByEmail.hospital_id },
                        data: { admin_id: adminId },
                    });
                    console.log('Updated hospital:', updated);
                }
            }
        }

        console.log('Testing getAlerts query...');
        if (hospitalByAdmin || true) {
            const alerts = await prisma.emergencyAlert.findMany({
                where: {
                    sent_to_hospital: true,
                    status: { not: 'acknowledge' },
                    NOT: [
                        { alert_message: { contains: 'record access shared' } },
                        { alert_message: { contains: 'shared access' } },
                    ],
                },
                take: 5
            });
            console.log('Alerts sample:', alerts);
        }

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
