import { hospitalAdminService } from './modules/hospitals/hospital-admin.service';
import prisma from './config/database';
import * as fs from 'fs';

async function testProfile() {
    try {
        const adminId = 15;
        console.log('Testing adminId 15...');
        const profile = await hospitalAdminService.getProfile(adminId);
        fs.writeFileSync('debug_result.json', JSON.stringify({ success: true, profile }, null, 2));
    } catch (error: any) {
        fs.writeFileSync('debug_error.json', JSON.stringify({
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack,
            meta: error.meta
        }, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

testProfile();
