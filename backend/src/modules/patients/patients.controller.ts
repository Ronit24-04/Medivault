import { Response, NextFunction } from 'express';
import { patientsService } from './patients.service';
import { AuthRequest } from '../../middleware/auth.middleware';

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
            const patientId = parseInt(req.params.patientId);
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
            const patientId = parseInt(req.params.patientId);
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

    async deletePatient(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId);
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
            const patientId = parseInt(req.params.patientId);
            const info = await patientsService.getEmergencyInfo(req.admin!.adminId, patientId);
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
