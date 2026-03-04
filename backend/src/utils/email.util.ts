import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: parseInt(env.EMAIL_PORT),
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    // Gmail app passwords are often copied with spaces; normalize before use.
    pass: env.EMAIL_PASSWORD.replace(/\s+/g, ''),
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ─── Shared email wrapper ─────────────────────────────────────────────────────
const wrapEmail = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MediVault</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a5ce5 0%,#0f3fa8 100%);padding:32px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="width:42px;height:42px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-block;line-height:42px;text-align:center;font-size:22px;margin-right:12px;vertical-align:middle;">🏥</div>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;vertical-align:middle;">mediVault</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px 0;color:#6b7280;font-size:13px;">MediVault – Secure Digital Medical Records</p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                This email was sent by MediVault. If you didn't request this, please ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Base sender ──────────────────────────────────────────────────────────────
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

// ─── 1. Email Verification (sent once at registration) ────────────────────────
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
): Promise<void> => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const content = `
      <h2 style="margin:0 0 8px 0;color:#111827;font-size:22px;font-weight:700;">Welcome to MediVault! 🎉</h2>
      <p style="margin:0 0 24px 0;color:#6b7280;font-size:15px;line-height:1.6;">
        You're almost there! Please verify your email address to activate your account and start managing your medical records securely.
      </p>

      <!-- CTA Button -->
      <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a5ce5,#0f3fa8);border-radius:8px;">
            <a href="${verificationUrl}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
              ✅ Verify My Email
            </a>
          </td>
        </tr>
      </table>

      <!-- What's next -->
      <div style="background:#f0f7ff;border-left:4px solid #1a5ce5;border-radius:6px;padding:16px 20px;margin:0 0 24px 0;">
        <p style="margin:0 0 8px 0;color:#1e40af;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">What happens next?</p>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
          ✔ Click the button above to verify your email<br/>
          ✔ Log in to your MediVault account<br/>
          ✔ Upload and manage your medical records securely
        </p>
      </div>

      <!-- Fallback link -->
      <p style="margin:0 0 6px 0;color:#6b7280;font-size:13px;">Button not working? Copy and paste this link into your browser:</p>
      <p style="margin:0 0 24px 0;font-size:13px;word-break:break-all;">
        <a href="${verificationUrl}" style="color:#1a5ce5;">${verificationUrl}</a>
      </p>

      <!-- Expiry notice -->
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;">
        <p style="margin:0;color:#92400e;font-size:13px;">⏰ <strong>This link expires in 24 hours.</strong> If it expires, please register again.</p>
      </div>
    `;

  await sendEmail({
    to: email,
    subject: '✅ Verify Your MediVault Account',
    html: wrapEmail(content),
    text: `Welcome to MediVault! Verify your email by visiting: ${verificationUrl}\n\nThis link expires in 24 hours.`,
  });
};

// ─── 2. Password Reset (only triggered by user clicking "Forgot Password") ────
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const content = `
      <h2 style="margin:0 0 8px 0;color:#111827;font-size:22px;font-weight:700;">Reset Your Password 🔐</h2>
      <p style="margin:0 0 24px 0;color:#6b7280;font-size:15px;line-height:1.6;">
        We received a request to reset the password for your MediVault account. Click the button below to choose a new one.
      </p>

      <!-- CTA Button -->
      <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a5ce5,#0f3fa8);border-radius:8px;">
            <a href="${resetUrl}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
              🔑 Reset My Password
            </a>
          </td>
        </tr>
      </table>

      <!-- Security notice -->
      <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:6px;padding:16px 20px;margin:0 0 24px 0;">
        <p style="margin:0 0 6px 0;color:#9a3412;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Security Notice</p>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
          ⏰ This link expires in <strong>1 hour</strong>.<br/>
          🔒 If you did not request a password reset, please ignore this email — your account is safe.
        </p>
      </div>

      <!-- Fallback link -->
      <p style="margin:0 0 6px 0;color:#6b7280;font-size:13px;">Button not working? Copy and paste this link:</p>
      <p style="margin:0;font-size:13px;word-break:break-all;">
        <a href="${resetUrl}" style="color:#1a5ce5;">${resetUrl}</a>
      </p>
    `;

  await sendEmail({
    to: email,
    subject: '🔐 Reset Your MediVault Password',
    html: wrapEmail(content),
    text: `Reset your MediVault password by visiting: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
  });
};

// ─── 3. Emergency Alert (sent to emergency contacts when patient triggers SOS) ─
export const sendEmergencyAlert = async (
  contactEmail: string,
  patientName: string,
  alertMessage: string,
  location?: string
): Promise<void> => {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const content = `
      <!-- Alert Banner -->
      <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:8px;padding:20px 24px;margin:0 0 24px 0;text-align:center;">
        <p style="margin:0 0 6px 0;font-size:28px;">🚨</p>
        <h2 style="margin:0;color:#991b1b;font-size:22px;font-weight:800;letter-spacing:-0.3px;">EMERGENCY ALERT</h2>
        <p style="margin:8px 0 0 0;color:#b91c1c;font-size:14px;font-weight:600;">Immediate Attention Required</p>
      </div>

      <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.6;">
        You are listed as an emergency contact for <strong>${patientName}</strong>.
        An emergency alert has been triggered at <strong>${now}</strong>.
      </p>

      <!-- Alert Message -->
      <div style="background:#fff1f2;border-left:4px solid #ef4444;border-radius:6px;padding:16px 20px;margin:0 0 20px 0;">
        <p style="margin:0 0 6px 0;color:#991b1b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Alert Message</p>
        <p style="margin:0;color:#111827;font-size:15px;line-height:1.6;">${alertMessage}</p>
      </div>

      ${location ? `
      <!-- Location -->
      <div style="background:#f0f7ff;border-left:4px solid #3b82f6;border-radius:6px;padding:16px 20px;margin:0 0 20px 0;">
        <p style="margin:0 0 6px 0;color:#1e40af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">📍 Last Known Location</p>
        <p style="margin:0;color:#111827;font-size:15px;">${location}</p>
      </div>
      ` : ''}

      <!-- Action callout -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:0 0 8px 0;">
        <p style="margin:0;color:#166534;font-size:14px;font-weight:700;">⚡ What to do now:</p>
        <p style="margin:8px 0 0 0;color:#374151;font-size:14px;line-height:1.7;">
          1. Try calling <strong>${patientName}</strong> immediately<br/>
          2. If no response, contact emergency services (112 / 108)<br/>
          3. If you know their location, proceed there or send help
        </p>
      </div>
    `;

  await sendEmail({
    to: contactEmail,
    subject: `🚨 EMERGENCY — ${patientName} needs help!`,
    html: wrapEmail(content),
    text: `EMERGENCY ALERT: ${patientName} has triggered an emergency alert.\n\nMessage: ${alertMessage}${location ? `\n\nLocation: ${location}` : ''}\n\nPlease contact them immediately or call emergency services (112/108).`,
  });
};

// ─── 4. Shared Access (sent to hospital/contact when patient grants access) ───
export const sendSharedAccessEmail = async (
  recipientEmail: string,
  options: {
    providerName: string;
    accessLevel: string;
    expiresOn?: string;
    shareUrl: string;
  }
): Promise<void> => {
  const content = `
      <h2 style="margin:0 0 8px 0;color:#111827;font-size:22px;font-weight:700;">Medical Records Shared With You 📋</h2>
      <p style="margin:0 0 24px 0;color:#6b7280;font-size:15px;line-height:1.6;">
        Hello <strong>${options.providerName}</strong>, a MediVault patient has granted you access to their medical records.
      </p>

      <!-- Access Details -->
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px 24px;margin:0 0 28px 0;">
        <p style="margin:0 0 12px 0;color:#1e40af;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Access Details</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:14px;width:140px;">Access Level</td>
            <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${options.accessLevel}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:14px;">Expires On</td>
            <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${options.expiresOn || 'No expiration set'}</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a5ce5,#0f3fa8);border-radius:8px;">
            <a href="${options.shareUrl}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
              📂 View Shared Records
            </a>
          </td>
        </tr>
      </table>

      <!-- Privacy notice -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px 16px;">
        <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
          🔒 This access is governed by MediVault's privacy policy. Handle all medical data with strict confidentiality.
        </p>
      </div>
    `;

  await sendEmail({
    to: recipientEmail,
    subject: '📋 Medical Records Shared With You – MediVault',
    html: wrapEmail(content),
    text: `Hello ${options.providerName}, a MediVault patient has shared medical records with you.\n\nAccess Level: ${options.accessLevel}\nExpires: ${options.expiresOn || 'No expiration'}\n\nView records: ${options.shareUrl}`,
  });
};
