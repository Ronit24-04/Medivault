import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload {
    adminId: number;
    email: string;
    userType: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
};

export const verifyAccessToken = (token: string): JWTPayload => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
    try {
        return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

export const generateTokenPair = (payload: JWTPayload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};
