import { admin_user_type, admin_account_status } from '@prisma/client';
import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/bcrypt.util';
import { generateTokenPair, verifyRefreshToken } from '../../utils/jwt.util';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/email.util';
import { generateRandomToken } from '../../utils/helpers.util';
import { AppError } from '../../middleware/error.middleware';

interface RegisterData {
    email: string;
    password: string;
    phoneNumber?: string;
    userType: string;
    fullName?: string;
}

interface LoginData {
    email: string;
    password: string;
}

export class AuthService {
    async register(data: RegisterData) {
        // Check if admin already exists
        const existingAdmin = await prisma.admin.findFirst({
            where: { email: data.email },
        });

        if (existingAdmin) {
            throw new AppError(409, 'Email already registered');
        }

        // Hash password
        const passwordHash = await hashPassword(data.password);

        // Generate verification token and set 24-hour expiry
        const verificationToken = generateRandomToken();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Create admin with token stored in DB
        const admin = await prisma.admin.create({
            data: {
                email: data.email,
                password_hash: passwordHash,
                phone_number: data.phoneNumber || '',
                user_type: data.userType as admin_user_type,
                account_status: 'active' as admin_account_status,
                email_verified: false,
                verification_token: verificationToken,
                verification_token_expires: verificationTokenExpires,
            },
            select: {
                admin_id: true,
                email: true,
                user_type: true,
                phone_number: true,
                created_at: true,
            },
        });

        // Send verification email in the background (don't await to avoid timeouts)
        sendVerificationEmail(admin.email, verificationToken).catch((err) => {
            console.error('Background verification email failed:', err);
        });

        // If user_type is patient and fullName provided, auto-create primary Patient record
        if (data.userType === 'patient' && data.fullName) {
            await prisma.patient.create({
                data: {
                    admin_id: admin.admin_id,
                    full_name: data.fullName,
                    address: '',
                    date_of_birth: new Date('1900-01-01'),
                    gender: 'Other',
                    relationship: 'self',
                    is_primary: true,
                },
            });
        }

        // Ensure hospital users are searchable in shared access by creating a hospital profile row
        if (data.userType === 'hospital') {
            const fallbackName =
                data.fullName?.trim() || data.email.split('@')[0].replace(/[._-]/g, ' ').trim() || 'Hospital';

            await prisma.hospital.create({
                data: {
                    admin_id: admin.admin_id,
                    hospital_name: fallbackName,
                    address: '',
                    city: '',
                    state: '',
                    phone_number: data.phoneNumber || '',
                    email: data.email,
                    hospital_type: 'private',
                },
            });
        }

        return {
            admin,
            message: 'Registration successful. Please check your email to verify your account.',
        };
    }

    async login(data: LoginData) {
        // Find admin
        const admin = await prisma.admin.findFirst({
            where: { email: data.email },
        });

        if (!admin) {
            throw new AppError(401, 'Invalid email or password');
        }

        // Check if account is active
        if (admin.account_status !== 'active') {
            throw new AppError(403, 'Account is suspended or deleted');
        }

        // Verify password
        const isPasswordValid = await comparePassword(data.password, admin.password_hash);

        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid email or password');
        }

        // Block login if email has not been verified yet
        if (!admin.email_verified) {
            throw new AppError(403, 'Please verify your email before logging in. Check your inbox for the verification link.');
        }

        // Update last login
        await prisma.admin.update({
            where: { admin_id: admin.admin_id },
            data: { last_login: new Date() },
        });

        // Generate tokens
        const tokens = generateTokenPair({
            adminId: admin.admin_id,
            email: admin.email,
            userType: admin.user_type as string,
        });

        return {
            admin: {
                admin_id: admin.admin_id,
                email: admin.email,
                user_type: admin.user_type,
                phone_number: admin.phone_number,
                email_verified: admin.email_verified,
            },
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const decoded = verifyRefreshToken(refreshToken);

            // Verify admin still exists and is active
            const admin = await prisma.admin.findUnique({
                where: { admin_id: decoded.adminId },
            });

            if (!admin || admin.account_status !== 'active') {
                throw new AppError(401, 'Invalid refresh token');
            }

            // Generate new tokens
            const tokens = generateTokenPair({
                adminId: admin.admin_id,
                email: admin.email,
                userType: admin.user_type,
            });

            return tokens;
        } catch (error) {
            throw new AppError(401, 'Invalid or expired refresh token');
        }
    }

    async forgotPassword(email: string) {
        const admin = await prisma.admin.findFirst({
            where: { email },
        });

        // Don't reveal if email exists or not
        if (!admin) {
            return {
                message: 'If the email exists, a password reset link has been sent',
            };
        }

        // Generate a reset token and store it with a 1-hour expiry.
        // Prefix with "reset:" so it cannot be confused with an email
        // verification token stored in the same column.
        const rawToken = generateRandomToken();
        const storedToken = `reset:${rawToken}`;
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.admin.update({
            where: { admin_id: admin.admin_id },
            data: {
                verification_token: storedToken,
                verification_token_expires: expiresAt,
            },
        });

        // Send email with the raw token (no prefix) in the URL
        sendPasswordResetEmail(email, rawToken).catch((err) => {
            console.error('Background password reset email failed:', err);
        });

        return {
            message: 'If the email exists, a password reset link has been sent',
        };
    }

    async resetPassword(token: string, newPassword: string) {
        // The stored token is prefixed with "reset:" to distinguish it from
        // email verification tokens in the same column.
        const storedToken = `reset:${token}`;

        const admin = await prisma.admin.findFirst({
            where: { verification_token: storedToken },
        });

        if (!admin) {
            throw new AppError(400, 'Invalid or expired password reset link. Please request a new one.');
        }

        // Check expiry
        if (!admin.verification_token_expires || admin.verification_token_expires < new Date()) {
            // Clear the expired token
            await prisma.admin.update({
                where: { admin_id: admin.admin_id },
                data: { verification_token: null, verification_token_expires: null },
            });
            throw new AppError(400, 'Password reset link has expired. Please request a new one.');
        }

        // Hash the new password and save, then clear the reset token
        const newPasswordHash = await hashPassword(newPassword);

        await prisma.admin.update({
            where: { admin_id: admin.admin_id },
            data: {
                password_hash: newPasswordHash,
                verification_token: null,
                verification_token_expires: null,
            },
        });

        return { message: 'Password reset successful' };
    }

    async verifyEmail(token: string) {
        // Find the admin with this exact token
        const admin = await prisma.admin.findFirst({
            where: { verification_token: token },
        });

        if (!admin) {
            throw new AppError(400, 'Invalid or expired verification link. Please register again or request a new link.');
        }

        // Check token has not expired
        if (!admin.verification_token_expires || admin.verification_token_expires < new Date()) {
            throw new AppError(400, 'Your verification link has expired. Please register again or contact support.');
        }

        // Mark as verified and clear the token
        await prisma.admin.update({
            where: { admin_id: admin.admin_id },
            data: {
                email_verified: true,
                verification_token: null,
                verification_token_expires: null,
            },
        });

        return { message: 'Email verified successfully! You can now log in.' };
    }

    async setupEmergencyPin(_adminId: number, _pin: string): Promise<{ message: string }> {
        // Emergency PIN is stored on Patient model, not Admin
        // This needs to be refactored to work with patient_id
        throw new AppError(501, 'Emergency PIN setup not yet implemented for this user type');
    }

    async verifyEmergencyPin(_email: string, _pin: string): Promise<{ message: string; patients: never[] }> {
        // Emergency PIN is stored on Patient model, not Admin
        // This needs to be refactored
        throw new AppError(501, 'Emergency PIN verification not yet implemented');
    }

    async getProfile(adminId: number) {
        const admin = await prisma.admin.findUnique({
            where: { admin_id: adminId },
            select: {
                admin_id: true,
                email: true,
                phone_number: true,
                user_type: true,
                email_verified: true,
                account_status: true,
                created_at: true,
                last_login: true,
            },
        });

        if (!admin) {
            throw new AppError(404, 'Admin not found');
        }

        return admin;
    }

    async updateProfile(adminId: number, data: { phoneNumber?: string }) {
        const admin = await prisma.admin.update({
            where: { admin_id: adminId },
            data: {
                ...(data.phoneNumber !== undefined && { phone_number: data.phoneNumber }),
            },
            select: {
                admin_id: true,
                email: true,
                phone_number: true,
                user_type: true,
                email_verified: true,
                account_status: true,
                created_at: true,
                last_login: true,
            },
        });

        return admin;
    }
}

export const authService = new AuthService();
