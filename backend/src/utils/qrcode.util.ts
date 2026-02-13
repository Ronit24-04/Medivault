import QRCode from 'qrcode';
import { env } from '../config/env';

export interface QRCodeOptions {
    data: string;
    size?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export const generateQRCode = async (options: QRCodeOptions): Promise<string> => {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(options.data, {
            width: options.size || parseInt(env.QR_CODE_SIZE),
            errorCorrectionLevel: options.errorCorrectionLevel || env.QR_CODE_ERROR_CORRECTION,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('QR Code generation failed:', error);
        throw new Error('Failed to generate QR code');
    }
};

export const generateEmergencyQRCode = async (
    patientId: number,
    accessCode: string
): Promise<string> => {
    const emergencyUrl = `${env.FRONTEND_URL}/emergency-access?patientId=${patientId}&code=${accessCode}`;
    return generateQRCode({ data: emergencyUrl });
};

export const generateShareQRCode = async (shareCode: string): Promise<string> => {
    const shareUrl = `${env.FRONTEND_URL}/shared-records?code=${shareCode}`;
    return generateQRCode({ data: shareUrl });
};
