import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const token = bearerToken || req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }

    try {
        const { userId } = verifyAccessToken(token);
        (req as any).userId = userId;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}