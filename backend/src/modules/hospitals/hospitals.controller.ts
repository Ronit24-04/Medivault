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

    async getHospitalById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const hospitalId = parseInt(req.params.hospitalId);
            const hospital = await hospitalsService.getHospitalById(hospitalId);

            if (!hospital) {
                return res.status(404).json({
                    success: false,
                    message: 'Hospital not found',
                });
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
