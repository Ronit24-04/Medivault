import { Response, NextFunction } from 'express';
import { recordsService } from './records.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class RecordsController {
    async uploadRecord(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId);
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                });
            }

            const recordData = {
                ...req.body,
                fileUrl: (file as any).path, // Cloudinary URL
                fileType: file.mimetype,
                fileSize: file.size,
            };

            const record = await recordsService.uploadRecord(req.admin!.adminId, patientId, recordData);

            res.status(201).json({
                success: true,
                message: 'Record uploaded successfully',
                data: record,
            });
        } catch (error) {
            next(error);
        }
    }

    async getRecords(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId);
            const records = await recordsService.getRecords(req.admin!.adminId, patientId, req.query);

            res.status(200).json({
                success: true,
                data: records,
            });
        } catch (error) {
            next(error);
        }
    }

    async getRecordById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId);
            const recordId = parseInt(req.params.recordId);
            const record = await recordsService.getRecordById(req.admin!.adminId, patientId, recordId);

            res.status(200).json({
                success: true,
                data: record,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateRecord(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId);
            const recordId = parseInt(req.params.recordId);
            const record = await recordsService.updateRecord(req.admin!.adminId, patientId, recordId, req.body);

            res.status(200).json({
                success: true,
                message: 'Record updated successfully',
                data: record,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteRecord(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId);
            const recordId = parseInt(req.params.recordId);
            const result = await recordsService.deleteRecord(req.admin!.adminId, patientId, recordId);

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    async getTimeline(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(req.params.patientId);
            const timeline = await recordsService.getTimeline(req.admin!.adminId, patientId);

            res.status(200).json({
                success: true,
                data: timeline,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const recordsController = new RecordsController();
