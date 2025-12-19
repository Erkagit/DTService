// Vercel Serverless Function Entry Point
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Initialize Prisma with error handling
let prisma;
try {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} catch (error) {
  console.error('Failed to initialize Prisma:', error);
}

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'dts-super-secret-key-production-2025';

// CORS configuration - Allow specific origins
const allowedOrigins = [
  'https://www.achirbairon.mn',
  'https://achirbairon.mn',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Root route
app.get('/', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      message: 'DTS Backend API', 
      status: 'running', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.json({ 
      message: 'DTS Backend API', 
      status: 'running', 
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { name: email }] },
      include: { company: true }
    });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('Login successful:', email);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Companies
app.get('/api/companies', async (req, res) => {
  const companies = await prisma.company.findMany({ include: { users: true } });
  res.json(companies);
});

app.post('/api/companies', async (req, res) => {
  const company = await prisma.company.create({ data: req.body });
  res.json(company);
});

app.put('/api/companies/:id', async (req, res) => {
  const company = await prisma.company.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(company);
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    // First delete related users
    await prisma.user.deleteMany({ where: { companyId: parseInt(req.params.id) } });
    // Delete related orders
    await prisma.order.deleteMany({ where: { companyId: parseInt(req.params.id) } });
    // Delete related preorders
    await prisma.preOrder.deleteMany({ where: { companyId: parseInt(req.params.id) } });
    // Then delete company
    await prisma.company.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company', details: error.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({ include: { company: true } });
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

app.post('/api/users', async (req, res) => {
  const { password, ...data } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
    include: { company: true }
  });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/:id', async (req, res) => {
  const { password, ...data } = req.body;
  const updateData = password ? { ...data, password: await bcrypt.hash(password, 10) } : data;
  const user = await prisma.user.update({
    where: { id: parseInt(req.params.id) },
    data: updateData,
    include: { company: true }
  });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

// Vehicles
app.get('/api/vehicles', async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({ include: { device: true, orders: true } });
  res.json(vehicles);
});

app.post('/api/vehicles', async (req, res) => {
  const vehicle = await prisma.vehicle.create({ data: req.body });
  res.json(vehicle);
});

app.put('/api/vehicles/:id', async (req, res) => {
  const vehicle = await prisma.vehicle.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(vehicle);
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    // Delete related orders first
    await prisma.order.deleteMany({ where: { vehicleId: parseInt(req.params.id) } });
    // Delete the vehicle
    await prisma.vehicle.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Failed to delete vehicle', details: error.message });
  }
});

// Devices
app.get('/api/devices', async (req, res) => {
  const devices = await prisma.device.findMany({ include: { vehicle: true } });
  res.json(devices);
});

app.post('/api/devices', async (req, res) => {
  const device = await prisma.device.create({ data: req.body });
  res.json(device);
});

app.put('/api/devices/:id', async (req, res) => {
  const device = await prisma.device.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(device);
});

app.delete('/api/devices/:id', async (req, res) => {
  try {
    // Unlink from vehicle first
    await prisma.vehicle.updateMany({ 
      where: { deviceId: parseInt(req.params.id) },
      data: { deviceId: null }
    });
    await prisma.device.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ error: 'Failed to delete device', details: error.message });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { company: true, vehicle: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const order = await prisma.order.create({
    data: req.body,
    include: { company: true, vehicle: true }
  });
  res.json(order);
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: { company: true, vehicle: true }
    });
    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const orderId = parseInt(req.params.id);
    
    // Update the order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { company: true, vehicle: true }
    });
    
    // Create status history entry
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        note: note || `Status changed to ${status}`
      }
    });
    
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
});
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    // Delete order status history first
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: parseInt(req.params.id) } });
    await prisma.order.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order', details: error.message });
  }
});

// PreOrders
app.get('/api/preorders', async (req, res) => {
  const preOrders = await prisma.preOrder.findMany({
    include: { company: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(preOrders);
});

app.post('/api/preorders', async (req, res) => {
  const preOrder = await prisma.preOrder.create({
    data: req.body,
    include: { company: true }
  });
  res.json(preOrder);
});

app.put('/api/preorders/:id', async (req, res) => {
  const preOrder = await prisma.preOrder.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
    include: { company: true }
  });
  res.json(preOrder);
});

app.delete('/api/preorders/:id', async (req, res) => {
  try {
    await prisma.preOrder.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete preorder error:', error);
    res.status(500).json({ error: 'Failed to delete preorder', details: error.message });
  }
});

module.exports = app;
