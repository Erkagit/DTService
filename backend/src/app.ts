import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware/auth';
import { generateToken } from './utils/jwt';
import { companyRouter } from './routes/company';
import { userRouter } from './routes/user';
import { deviceRouter } from './routes/device';
import { vehicleRouter } from './routes/vehicle';
import { orderRouter } from './routes/order';
import { preOrderRouter } from './routes/preorder';

export const prisma = new PrismaClient();
const app = express();

// CRITICAL: CORS must be BEFORE any routes
app.use(cors({
  origin: true,
  credentials: true,
}));

// CRITICAL: Body parsers MUST be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    service: 'achir-bayron-llc-backend', 
    timestamp: new Date(),
    version: '1.0.0',
    jwt: 'enabled'
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is empty' });
    }
    
    if (!email) {
      return res.status(400).json({ error: 'Email or name is required' });
    }
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    // Try to find user by email first, then by name
    let user = await prisma.user.findUnique({ 
      where: { email },
      include: { company: true } 
    });
    
    // If not found by email, try finding by name
    if (!user) {
      user = await prisma.user.findFirst({
        where: { name: email },
        include: { company: true }
      });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Account password not set' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    });
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// /api/auth/me
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { company: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected routes
app.use(authMiddleware);
app.use('/api/companies', companyRouter);
app.use('/api/users', userRouter);
app.use('/api/devices', deviceRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/orders', orderRouter);
app.use('/api/preorders', preOrderRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;