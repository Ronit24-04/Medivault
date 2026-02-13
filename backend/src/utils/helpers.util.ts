import crypto from 'crypto';

export const generateRandomToken = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
};

export const generateAccessCode = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export const generate6DigitPin = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
