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

// Debug middleware
app.use((req, res, next) => {
  console.log(`\n=== ${new Date().toISOString()} - ${req.method} ${req.path} ===`);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('===\n');
  next();
});

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
    console.log('🔐 LOGIN ATTEMPT');
    console.log('Request body:', req.body);
    console.log('Email/Name:', req.body?.email);
    console.log('Password:', req.body?.password);
    
    const { email, password } = req.body;
    
    // Check if body was parsed
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('❌ Request body is empty!');
      return res.status(400).json({ error: 'Request body is empty' });
    }
    
    if (!email) {
      console.log('❌ Email/Name missing');
      return res.status(400).json({ error: 'Email or name is required' });
    }
    
    if (!password) {
      console.log('❌ Password missing from request body');
      return res.status(400).json({ error: 'Password is required' });
    }
    
    console.log('✅ Email/Name and password provided');
    
    // Try to find user by email first, then by name
    let user = await prisma.user.findUnique({ 
      where: { email },
      include: { company: true } 
    });
    
    // If not found by email, try finding by name
    if (!user) {
      user = await prisma.user.findFirst({
        where: { name: email }, // using email field for name input
        include: { company: true }
      });
    }
    
    if (!user) {
      console.log('❌ User not found by email or name');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.email);

    if (!user.password) {
      console.log('❌ User has no password');
      return res.status(401).json({ error: 'Account password not set' });
    }

    console.log('✅ Comparing passwords...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    });
    
    console.log('✅✅✅ Login successful! Token generated.');
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('💥 Login error:', error);
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