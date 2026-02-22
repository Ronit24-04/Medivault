import { Response, NextFunction } from 'express';
import { hospitalsService } from './hospitals.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class HospitalsController {
    async getHospitals(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const hospitals = await hospitalsService.getHospitals(req.query);
            res.status(200).json({
                success: true,
                data: hospitals,
            });
        } catch (error) {
            next(error);
        }
    }

    async getHospitalById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const hospitalId = parseInt(req.params.hospitalId as string);
            const hospital = await hospitalsService.getHospitalById(hospitalId);

            if (!hospital) {
                res.status(404).json({
                    success: false,
                    message: 'Hospital not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: hospital,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const hospitalsController = new HospitalsController();
