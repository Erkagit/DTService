import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../libs/prisma';
import { requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Get all users (Admin only)
router.get('/', requireRole(Role.ADMIN), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        company: true
      }
    });
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    res.json(usersWithoutPasswords);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user (Admin only)
router.post('/', requireRole(Role.ADMIN), async (req, res) => {
  try {
    const { email, name, password, role, companyId } = req.body;

    // Validation
    if (!email || !name || !password || !role) {
      return res.status(400).json({ 
        error: 'Email, name, password, and role are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Validate role
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${Object.values(Role).join(', ')}` 
      });
    }

    // CLIENT_ADMIN must have a company
    if (role === Role.CLIENT_ADMIN && !companyId) {
      return res.status(400).json({ 
        error: 'CLIENT_ADMIN role requires a companyId' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { 
        email, 
        name, 
        password: hashedPassword,
        role, 
        companyId: companyId || null
      },
      include: {
        company: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get users by company (Admin or company's CLIENT_ADMIN)
router.get('/company/:companyId', async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const requestingUser = req.user;

    // Check authorization
    if (requestingUser?.role !== Role.ADMIN && requestingUser?.companyId !== companyId) {
      return res.status(403).json({ 
        error: 'Forbidden: You can only view users from your own company' 
      });
    }

    const users = await prisma.user.findMany({
      where: { companyId }
    });

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.json(usersWithoutPasswords);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as userRouter };
