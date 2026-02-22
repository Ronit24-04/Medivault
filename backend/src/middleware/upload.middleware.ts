import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import fs from 'fs';
import path from 'path';
import cloudinary from '../config/cloudinary';
import { env } from '../config/env';

// Cloudinary storage for medical records
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'medivault/medical-records',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            resource_type: 'auto',
            transformation: file.mimetype.startsWith('image/')
                ? [{ quality: 'auto', fetch_format: 'auto' }]
                : undefined,
        };
    },
});

// Cloudinary storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'medivault/profiles',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
            ],
        };
    },
});

// File filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = env.ALLOWED_FILE_TYPES.split(',');

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
};

// Upload middleware for medical records
export const uploadMedicalRecord = multer({
    storage: cloudinaryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(env.MAX_FILE_SIZE),
    },
});

// Upload middleware for profile pictures
export const uploadProfilePicture = multer({
    storage: profilePictureStorage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile pictures'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for profile pictures
    },
});

const profileImagesDir = path.join(process.cwd(), 'uploads', 'profile-images');
if (!fs.existsSync(profileImagesDir)) {
    fs.mkdirSync(profileImagesDir, { recursive: true });
}

const localProfileImageStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, profileImagesDir);
    },
    filename: (req: any, file, cb) => {
        const patientId = req.params.patientId || 'patient';
        const extension = path.extname(file.originalname) || '.jpg';
        cb(null, `${patientId}-${Date.now()}${extension}`);
    },
});

export const uploadProfileImage = multer({
    storage: localProfileImageStorage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
            return;
        }
        cb(new Error('Only image files are allowed'));
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
