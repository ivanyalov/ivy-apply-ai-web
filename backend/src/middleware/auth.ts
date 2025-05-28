import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
            };
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const authService = new AuthService();
        const decoded = authService.verifyToken(token);
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}; 