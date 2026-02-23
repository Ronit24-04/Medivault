import { Response, NextFunction } from 'express';
import { sharedAccessService } from './shared-access.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class SharedAccessController {
    async getSharedAccess(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId);
            const shares = await sharedAccessService.getSharedAccess(req.admin!.adminId, patientId);

            res.status(200).json({
                success: true,
                data: shares,
            });
        } catch (error) {
            next(error);
        }
    }

    async createShare(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId);
            const share = await sharedAccessService.createShare(req.admin!.adminId, patientId, req.body);

            res.status(201).json({
                success: true,
                message: 'Access granted successfully',
                data: share,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateShare(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId);
            const shareId = parseInt(Array.isArray(req.params.shareId) ? req.params.shareId[0] : req.params.shareId);
            const share = await sharedAccessService.updateShare(req.admin!.adminId, patientId, shareId, req.body);

            res.status(200).json({
                success: true,
                message: 'Access updated successfully',
                data: share,
            });
        } catch (error) {
            next(error);
        }
    }

    async revokeShare(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId);
            const shareId = parseInt(Array.isArray(req.params.shareId) ? req.params.shareId[0] : req.params.shareId);
            const result = await sharedAccessService.revokeShare(req.admin!.adminId, patientId, shareId);

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    async getSharedFiles(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId);
            const shareId = parseInt(Array.isArray(req.params.shareId) ? req.params.shareId[0] : req.params.shareId);
            const files = await sharedAccessService.getSharedFiles(req.admin!.adminId, patientId, shareId);

            res.status(200).json({
                success: true,
                data: files,
            });
        } catch (error) {
            next(error);
        }
    }

    async getStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const patientId = parseInt(Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId);
            const stats = await sharedAccessService.getStats(req.admin!.adminId, patientId);

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const sharedAccessController = new SharedAccessController();
