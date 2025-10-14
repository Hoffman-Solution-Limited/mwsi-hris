import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(user: JwtUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.header('authorization') || '';
  const parts = h.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return res.status(401).json({ error: 'unauthorized' });
  try {
    const decoded = jwt.verify(parts[1], JWT_SECRET) as JwtUser;
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

export function requireRole(allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user?.role || '').toLowerCase();
    // Expand shorthand roles: 'hr' covers hr_manager and hr_staff
    const expandedAllowed = new Set<string>([
      ...allowed,
      ...(allowed.includes('hr') ? ['hr_manager','hr_staff'] : []),
      ...(allowed.includes('registry') ? ['registry_manager','registry_staff'] : []),
    ]);
    if (!expandedAllowed.has(role)) return res.status(403).json({ error: 'forbidden' });
    return next();
  };
}
