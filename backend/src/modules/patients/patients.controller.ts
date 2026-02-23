import { Response, NextFunction } from 'express';
import { patientsService } from './patients.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';

export class PatientsController {
    async createPatient(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patient = await patientsService.createPatient(req.admin!.adminId, req.body);
            res.status(201).json({
                success: true,
                message: 'Patient created successfully',
                data: patient,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPatients(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patients = await patientsService.getPatients(req.admin!.adminId);
            res.status(200).json({
                success: true,
                data: patients,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPatientById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId as string);
            const patient = await patientsService.getPatientById(req.admin!.adminId, patientId);
            res.status(200).json({
                success: true,
                data: patient,
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePatient(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId as string);
            const patient = await patientsService.updatePatient(req.admin!.adminId, patientId, req.body);
            res.status(200).json({
                success: true,
                message: 'Patient updated successfully',
                data: patient,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProfileImage(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(
                Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId,
                10
            );

            if (!req.file?.filename) {
                throw new AppError(400, 'Profile image file is required');
            }

            const profileImagePath = `/uploads/profile-images/${req.file.filename}`;
            const patient = await patientsService.updateProfileImage(
                req.admin!.adminId,
                patientId,
                profileImagePath
            );

            res.status(200).json({
                success: true,
                message: 'Profile image updated successfully',
                data: patient,
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePatient(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId as string);
            const result = await patientsService.deletePatient(req.admin!.adminId, patientId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    async getEmergencyInfo(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId as string);
            const info = await patientsService.getEmergencyInfo(req.admin!.adminId, patientId);
            res.status(200).json({
                success: true,
                data: info,
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyProfilePin(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(
                Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId,
                10
            );
            const pin = String(req.body?.pin || '');
            const result = await patientsService.verifyProfilePin(req.admin!.adminId, patientId, pin);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPublicEmergencyInfo(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const email = String(req.query.email || '');
            const info = await patientsService.getPublicEmergencyInfo(email);
            res.status(200).json({
                success: true,
                data: info,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const patientsController = new PatientsController();
