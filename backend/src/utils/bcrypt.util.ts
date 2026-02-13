import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const hashPin = async (pin: string): Promise<string> => {
    return bcrypt.hash(pin, SALT_ROUNDS);
};

export const comparePin = async (
    pin: string,
    hashedPin: string
): Promise<boolean> => {
    return bcrypt.compare(pin, hashedPin);
};
