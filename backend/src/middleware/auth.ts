import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt';

const prisma = new PrismaClient();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;
        companyId?: number;
        id: number;
      };
    }
  }
}

// JWT Authentication Middleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authorization token is required' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      ...decoded,
      id: decoded.userId, // Alias for compatibility
    };

    next();
  } catch (error: any) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: error.message || 'Invalid or expired token'
    });
  }
};

// Role-based access control
export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Required role: ${roles.join(' or ')}`,
        currentRole: req.user.role
      });
    }

    next();
  };
};

// Company access control
export const requireCompanyAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.user.role === 'ADMIN') {
    return next();
  }
  
  const requestedCompanyId = parseInt(req.params.companyId || req.body?.companyId);
  
  if (!req.user.companyId) {
    return res.status(403).json({ error: 'User not assigned to any company' });
  }
  
  if (req.user.companyId !== requestedCompanyId) {
    return res.status(403).json({ error: 'Access denied to this company' });
  }
  
  next();
};

// Legacy authentication (for backward compatibility)
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const userId = req.headers['x-user-id'] as string;
    
    if (!apiKey || !userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide x-api-key and x-user-id headers'
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { company: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
