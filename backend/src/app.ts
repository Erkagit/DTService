import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { companyRouter } from './routes/company';
import { userRouter } from './routes/user';
import { deviceRouter } from './routes/device';
import { vehicleRouter } from './routes/vehicle';
import { orderRouter } from './routes/order';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Health check (public)
app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'dts-backend', timestamp: new Date() });
});

// Auth login (public)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });
        
        const user = await prisma.user.findUnique({ 
            where: { email },
            include: { company: true } 
        });
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        res.json({ 
            user,
            message: 'Use x-user-id header with value: ' + user.id
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Apply auth middleware to protected routes
app.use(authMiddleware);

// CRUD endpoints
app.use('/api/companies', companyRouter);
app.use('/api/users', userRouter);
app.use('/api/devices', deviceRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/orders', orderRouter);

export default app;
