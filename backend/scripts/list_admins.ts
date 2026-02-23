import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const admins = await prisma.admin.findMany({
        select: {
            email: true,
            user_type: true,
            account_status: true,
        }
    });
    console.log(JSON.stringify(admins, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
