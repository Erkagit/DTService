import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from './middleware/auth';
import { generateToken } from './utils/jwt';
import { companyRouter } from './routes/company';
import { userRouter } from './routes/user';
import { deviceRouter } from './routes/device';
import { vehicleRouter } from './routes/vehicle';
import { orderRouter } from './routes/order';

export const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check (public)
app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    service: 'dts-backend', 
    timestamp: new Date(),
    version: '1.0.0',
    jwt: 'enabled'
  });
});

// Auth login (public) - WITH JWT & PASSWORD
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { company: true } 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({ error: 'Account password not set. Contact administrator.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    });
    
    console.log('Login successful:', user.email);
    
    // Remove password from response
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

// Verify token endpoint (protected)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { company: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Apply JWT auth middleware to protected routes
app.use(authMiddleware);

// Protected routes
app.use('/api/companies', companyRouter);
app.use('/api/users', userRouter);
app.use('/api/devices', deviceRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/orders', orderRouter);

// 404 handler
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
