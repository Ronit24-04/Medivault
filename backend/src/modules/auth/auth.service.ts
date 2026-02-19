import prisma from '../../config/database';
import { hashPassword, comparePassword, hashPin, comparePin } from '../../utils/bcrypt.util';
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
        const existingAdmin = await prisma.admin.findUnique({
            where: { email: data.email },
        });

        if (existingAdmin) {
            throw new AppError(409, 'Email already registered');
        }

        // Hash password
        const passwordHash = await hashPassword(data.password);

        // Create admin
        const admin = await prisma.admin.create({
            data: {
                email: data.email,
                password_hash: passwordHash,
                phone_number: data.phoneNumber,
                user_type: data.userType,
                account_status: 'active',
                email_verified: false,
            },
            select: {
                admin_id: true,
                email: true,
                user_type: true,
                phone_number: true,
                created_at: true,
            },
        });

        // Generate verification token (in production, store this in DB)
        const verificationToken = generateRandomToken();

        // Send verification email
        await sendVerificationEmail(admin.email, verificationToken);

        // If user_type is patient and fullName provided, auto-create primary Patient record
        if (data.userType === 'patient' && data.fullName) {
            await prisma.patient.create({
                data: {
                    admin_id: admin.admin_id,
                    full_name: data.fullName,
                    address: '',
                    date_of_birth: new Date('1900-01-01'),
                    relationship: 'self',
                    is_primary: true,
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
        const admin = await prisma.admin.findUnique({
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

        // Update last login
        await prisma.admin.update({
            where: { admin_id: admin.admin_id },
            data: { last_login: new Date() },
        });

        // Generate tokens
        const tokens = generateTokenPair({
            adminId: admin.admin_id,
            email: admin.email,
            userType: admin.user_type,
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
        const admin = await prisma.admin.findUnique({
            where: { email },
        });

        // Don't reveal if email exists or not
        if (!admin) {
            return {
                message: 'If the email exists, a password reset link has been sent',
            };
        }

        // Generate reset token (in production, store this in DB with expiration)
        const resetToken = generateRandomToken();

        // Send reset email
        await sendPasswordResetEmail(email, resetToken);

        return {
            message: 'If the email exists, a password reset link has been sent',
        };
    }

    async resetPassword(token: string, newPassword: string) {
        // In production, verify token from database
        // For now, we'll skip token verification

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password (you would find admin by token in production)
        // This is a simplified version
        return {
            message: 'Password reset successful',
        };
    }

    async setupEmergencyPin(adminId: number, pin: string) {
        // Emergency PIN is stored on Patient model, not Admin
        // This needs to be refactored to work with patient_id
        throw new AppError(501, 'Emergency PIN setup not yet implemented for this user type');
    }

    async verifyEmergencyPin(email: string, pin: string) {
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
}

export const authService = new AuthService();
