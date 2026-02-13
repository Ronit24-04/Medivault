import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: parseInt(env.EMAIL_PORT),
    secure: env.EMAIL_SECURE,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        await transporter.sendMail({
            from: env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send email');
    }
};

export const sendVerificationEmail = async (
    email: string,
    verificationToken: string
): Promise<void> => {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
        to: email,
        subject: 'Verify Your MediVault Account',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to MediVault!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `,
        text: `Welcome to MediVault! Please verify your email by visiting: ${verificationUrl}`,
    });
};

export const sendPasswordResetEmail = async (
    email: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
        to: email,
        subject: 'Reset Your MediVault Password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #dc2626; margin-top: 20px;">
          This link will expire in 1 hour.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
        text: `Reset your password by visiting: ${resetUrl}`,
    });
};

export const sendEmergencyAlert = async (
    contactEmail: string,
    patientName: string,
    alertMessage: string,
    location?: string
): Promise<void> => {
    await sendEmail({
        to: contactEmail,
        subject: `🚨 EMERGENCY ALERT - ${patientName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 3px solid #dc2626; padding: 20px;">
        <h2 style="color: #dc2626;">🚨 EMERGENCY ALERT</h2>
        <p style="font-size: 16px;"><strong>${patientName}</strong> has triggered an emergency alert.</p>
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Message:</strong></p>
          <p style="margin: 10px 0 0 0;">${alertMessage}</p>
        </div>
        ${location ? `
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Location:</strong></p>
            <p style="margin: 10px 0 0 0;">${location}</p>
          </div>
        ` : ''}
        <p style="color: #dc2626; font-weight: bold; margin-top: 20px;">
          Please contact ${patientName} immediately or call emergency services if needed.
        </p>
      </div>
    `,
        text: `EMERGENCY ALERT: ${patientName} has triggered an emergency alert. ${alertMessage}${location ? ` Location: ${location}` : ''}`,
    });
};
