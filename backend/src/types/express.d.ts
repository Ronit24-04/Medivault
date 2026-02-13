import { Request } from 'express';
import { JWTPayload } from '../utils/jwt.util';

declare global {
    namespace Express {
        interface Request {
            admin?: JWTPayload;
        }
    }
}
