import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

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
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId || undefined
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }
    
    next();
  };
}

export function requireCompanyAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role === Role.ADMIN) {
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
}
