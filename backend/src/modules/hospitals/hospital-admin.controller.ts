import { Response, NextFunction } from 'express';
import { hospitalAdminService } from './hospital-admin.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class HospitalAdminController {
    async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.adminId;
            const profile = await hospitalAdminService.getProfile(adminId);
            res.json({ success: true, data: profile });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.adminId;
            const profile = await hospitalAdminService.updateProfile(adminId, req.body);
            res.json({ success: true, data: profile });
        } catch (error) {
            next(error);
        }
    }

    async getSharedRecords(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.adminId;
            const records = await hospitalAdminService.getSharedRecords(adminId);
            res.json({ success: true, data: records });
        } catch (error) {
            next(error);
        }
    }

    async getSharedRecordFiles(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.adminId;
            const shareId = parseInt(req.params.shareId as string, 10);
            const files = await hospitalAdminService.getSharedRecordFiles(adminId, shareId);
            res.json({ success: true, data: files });
        } catch (error) {
            next(error);
        }
    }

    async getAlerts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.adminId;
            const alerts = await hospitalAdminService.getAlerts(adminId);
            res.json({ success: true, data: alerts });
        } catch (error) {
            next(error);
        }
    }

    async updateSharedRecordStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.adminId;
            const shareId = parseInt((req.params as any).shareId, 10);
            const { status } = req.body;

            if (status !== 'acknowledged' && status !== 'rejected') {
                res.status(400).json({
                    success: false,
                    message: 'Invalid status. Use acknowledged or rejected',
                });
                return;
            }

            const updated = await hospitalAdminService.updateSharedRecordStatus(adminId, shareId, status);
            res.json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    async acknowledgeAlert(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.adminId;
            const alertId = parseInt((req.params as any).alertId, 10);
            const alert = await hospitalAdminService.acknowledgeAlert(adminId, alertId);
            res.json({ success: true, data: alert });
        } catch (error) {
            next(error);
        }
    }

    async acceptShare(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.adminId;
            const shareId = parseInt((req.params as any).shareId, 10);
            const share = await hospitalAdminService.acceptShare(adminId, shareId);
            res.json({ success: true, message: 'Access request accepted', data: share });
        } catch (error) {
            next(error);
        }
    }

    async rejectShare(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const adminId = req.admin!.adminId;
            const shareId = parseInt((req.params as any).shareId, 10);
            const share = await hospitalAdminService.rejectShare(adminId, shareId);
            res.json({ success: true, message: 'Access request rejected', data: share });
        } catch (error) {
            next(error);
        }
    }
}

export const hospitalAdminController = new HospitalAdminController();
