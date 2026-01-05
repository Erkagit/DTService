// Vercel Serverless Function Entry Point
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// Initialize Prisma with connection pooling for serverless
let prisma = null;
const getPrisma = () => {
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    
    // Add connection pool parameters for Supabase
    let dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes('connection_limit')) {
      // Limit connections for serverless environment
      const separator = dbUrl.includes('?') ? '&' : '?';
      dbUrl = `${dbUrl}${separator}connection_limit=1&pool_timeout=10`;
    }
    
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      },
      log: ['error', 'warn'],
    });
  }
  return prisma;
};

// Disconnect Prisma after each request in serverless
const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};

// Graceful shutdown for Prisma
process.on('beforeExit', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

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
    await getPrisma().$queryRaw`SELECT 1`;
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
    await getPrisma().$queryRaw`SELECT 1`;
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
    
    const user = await getPrisma().user.findFirst({
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
  const companies = await getPrisma().company.findMany({ include: { users: true } });
  res.json(companies);
});

app.post('/api/companies', async (req, res) => {
  const company = await getPrisma().company.create({ data: req.body });
  res.json(company);
});

app.put('/api/companies/:id', async (req, res) => {
  const company = await getPrisma().company.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(company);
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    
    // Get all orders for this company to delete their status history
    const orders = await getPrisma().order.findMany({ where: { companyId }, select: { id: true } });
    const orderIds = orders.map(o => o.id);
    
    // Delete order status history first
    if (orderIds.length > 0) {
      await getPrisma().orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
    }
    
    // Delete related orders
    await getPrisma().order.deleteMany({ where: { companyId } });
    // Delete related preorders
    await getPrisma().preOrder.deleteMany({ where: { companyId } });
    // Delete related users
    await getPrisma().user.deleteMany({ where: { companyId } });
    // Then delete company
    await getPrisma().company.delete({ where: { id: companyId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company', details: error.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  const users = await getPrisma().user.findMany({ include: { company: true } });
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

app.post('/api/users', async (req, res) => {
  const { password, ...data } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await getPrisma().user.create({
    data: { ...data, password: hashedPassword },
    include: { company: true }
  });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/:id', async (req, res) => {
  const { password, ...data } = req.body;
  const updateData = password ? { ...data, password: await bcrypt.hash(password, 10) } : data;
  const user = await getPrisma().user.update({
    where: { id: parseInt(req.params.id) },
    data: updateData,
    include: { company: true }
  });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await getPrisma().user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

// Vehicles
app.get('/api/vehicles', async (req, res) => {
  const vehicles = await getPrisma().vehicle.findMany({ include: { device: true, orders: true } });
  res.json(vehicles);
});

app.post('/api/vehicles', async (req, res) => {
  const vehicle = await getPrisma().vehicle.create({ data: req.body });
  res.json(vehicle);
});

app.put('/api/vehicles/:id', async (req, res) => {
  const vehicle = await getPrisma().vehicle.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(vehicle);
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);
    
    // Get all orders for this vehicle to delete their status history
    const orders = await getPrisma().order.findMany({ where: { vehicleId }, select: { id: true } });
    const orderIds = orders.map(o => o.id);
    
    // Delete order status history first
    if (orderIds.length > 0) {
      await getPrisma().orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
    }
    
    // Delete related orders
    await getPrisma().order.deleteMany({ where: { vehicleId } });
    // Delete location pings
    await getPrisma().locationPing.deleteMany({ where: { vehicleId } });
    // Delete the vehicle
    await getPrisma().vehicle.delete({ where: { id: vehicleId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Failed to delete vehicle', details: error.message });
  }
});

// Devices
app.get('/api/devices', async (req, res) => {
  const devices = await getPrisma().device.findMany({ include: { vehicle: true } });
  res.json(devices);
});

app.post('/api/devices', async (req, res) => {
  const device = await getPrisma().device.create({ data: req.body });
  res.json(device);
});

app.put('/api/devices/:id', async (req, res) => {
  const device = await getPrisma().device.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(device);
});

app.delete('/api/devices/:id', async (req, res) => {
  try {
    // Unlink from vehicle first
    await getPrisma().vehicle.updateMany({ 
      where: { deviceId: parseInt(req.params.id) },
      data: { deviceId: null }
    });
    await getPrisma().device.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ error: 'Failed to delete device', details: error.message });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  const orders = await getPrisma().order.findMany({
    include: { company: true, vehicle: true, preOrders: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const { origin, destination, vehicleId, companyId } = req.body;
  
  // Generate sequential order code
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  
  // Get the count of orders created today to generate sequential number
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  
  const ordersToday = await getPrisma().order.count({
    where: {
      createdAt: {
        gte: todayStart,
        lt: todayEnd
      }
    }
  });
  
  const sequentialNumber = String(ordersToday + 1).padStart(4, '0');
  const code = `Achir-Bairon-${y}-${m}-${d}-${sequentialNumber}`;
  
  const order = await getPrisma().order.create({
    data: {
      code,
      origin,
      destination,
      vehicleId: vehicleId ? parseInt(vehicleId) : null,
      companyId: parseInt(companyId),
      createdById: 1, // TODO: Replace with actual user id
    },
    include: { company: true, vehicle: true }
  });
  res.json(order);
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await getPrisma().order.update({
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
    const order = await getPrisma().order.update({
      where: { id: orderId },
      data: { status },
      include: { company: true, vehicle: true }
    });
    
    // Create status history entry
    await getPrisma().orderStatusHistory.create({
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

app.delete('/api/orders/:id', async (req, res) => {
  try {
    // Delete order status history first
    await getPrisma().orderStatusHistory.deleteMany({ where: { orderId: parseInt(req.params.id) } });
    await getPrisma().order.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order', details: error.message });
  }
});

// PreOrders
app.get('/api/preorders', async (req, res) => {
  try {
    const preOrders = await getPrisma().preOrder.findMany({
      where: {
        orderId: null  // Only get pre-orders that haven't been converted to orders
      },
      include: { company: true, order: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(preOrders);
  } catch (error) {
    console.error('Get preorders error:', error);
    res.status(500).json({ error: 'Failed to fetch preorders', details: error.message });
  }
});

// Get single preorder by ID
app.get('/api/preorders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const preOrder = await getPrisma().preOrder.findUnique({
      where: { id },
      include: { company: true, order: true }
    });
    if (!preOrder) {
      return res.status(404).json({ error: 'PreOrder not found' });
    }
    res.json(preOrder);
  } catch (error) {
    console.error('Get preorder error:', error);
    res.status(500).json({ error: 'Failed to fetch preorder', details: error.message });
  }
});

app.post('/api/preorders', async (req, res) => {
  try {
    const {
      companyId,
      pickupAddress,
      deliveryAddress,
      name,
      weight,
      dimension,
      loadingCost,
      transportCost,
      transshipmentCost,
      exportCustomsCost,
      mongolTransportCost,
      importCustomsCost,
      profit,
      expense,
      totalAmount,
      invoice,
      packageList,
      originDoc,
      vehicleType,
      foreignVehicleCount,
      mongolVehicleCount,
      trailerType,
      hasContainer,
      containerNumber,
      invoiceSent,
      paymentReceived,
      idleTime,
      transportDone,
      orderId,
    } = req.body;

    const preOrder = await getPrisma().preOrder.create({
      data: {
        companyId: companyId ? parseInt(companyId) : null,
        pickupAddress,
        deliveryAddress,
        name,
        weight: weight ? parseFloat(weight) : null,
        dimension,
        loadingCost: loadingCost ? parseFloat(loadingCost) : null,
        transportCost: transportCost ? parseFloat(transportCost) : null,
        transshipmentCost: transshipmentCost ? parseFloat(transshipmentCost) : null,
        exportCustomsCost: exportCustomsCost ? parseFloat(exportCustomsCost) : null,
        mongolTransportCost: mongolTransportCost ? parseFloat(mongolTransportCost) : null,
        importCustomsCost: importCustomsCost ? parseFloat(importCustomsCost) : null,
        profit: profit ? parseFloat(profit) : null,
        expense: expense ? parseFloat(expense) : null,
        totalAmount: totalAmount ? parseFloat(totalAmount) : null,
        invoice: invoice || false,
        packageList: packageList || false,
        originDoc: originDoc || false,
        vehicleType: vehicleType || 'DEFAULT',
        foreignVehicleCount: foreignVehicleCount ? parseInt(foreignVehicleCount) : null,
        mongolVehicleCount: mongolVehicleCount ? parseInt(mongolVehicleCount) : null,
        trailerType: trailerType || null,
        hasContainer: hasContainer || 'NO',
        containerNumber,
        invoiceSent: invoiceSent || false,
        paymentReceived: paymentReceived || false,
        idleTime: idleTime || false,
        transportDone: transportDone || false,
        orderId: orderId ? parseInt(orderId) : null,
      },
      include: { company: true, order: true }
    });
    res.status(201).json(preOrder);
  } catch (error) {
    console.error('Create preorder error:', error);
    res.status(500).json({ error: 'Failed to create preorder', details: error.message });
  }
});

app.put('/api/preorders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      companyId,
      pickupAddress,
      deliveryAddress,
      name,
      weight,
      dimension,
      loadingCost,
      transportCost,
      transshipmentCost,
      exportCustomsCost,
      mongolTransportCost,
      importCustomsCost,
      profit,
      expense,
      totalAmount,
      invoice,
      packageList,
      originDoc,
      vehicleType,
      foreignVehicleCount,
      mongolVehicleCount,
      trailerType,
      hasContainer,
      containerNumber,
      invoiceSent,
      paymentReceived,
      idleTime,
      transportDone,
    } = req.body;

    const preOrder = await getPrisma().preOrder.update({
      where: { id },
      data: {
        companyId: companyId !== undefined ? (companyId ? parseInt(companyId) : null) : undefined,
        pickupAddress,
        deliveryAddress,
        name,
        weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : undefined,
        dimension,
        loadingCost: loadingCost !== undefined ? (loadingCost ? parseFloat(loadingCost) : null) : undefined,
        transportCost: transportCost !== undefined ? (transportCost ? parseFloat(transportCost) : null) : undefined,
        transshipmentCost: transshipmentCost !== undefined ? (transshipmentCost ? parseFloat(transshipmentCost) : null) : undefined,
        exportCustomsCost: exportCustomsCost !== undefined ? (exportCustomsCost ? parseFloat(exportCustomsCost) : null) : undefined,
        mongolTransportCost: mongolTransportCost !== undefined ? (mongolTransportCost ? parseFloat(mongolTransportCost) : null) : undefined,
        importCustomsCost: importCustomsCost !== undefined ? (importCustomsCost ? parseFloat(importCustomsCost) : null) : undefined,
        profit: profit !== undefined ? (profit ? parseFloat(profit) : null) : undefined,
        expense: expense !== undefined ? (expense ? parseFloat(expense) : null) : undefined,
        totalAmount: totalAmount !== undefined ? (totalAmount ? parseFloat(totalAmount) : null) : undefined,
        invoice: invoice !== undefined ? invoice : undefined,
        packageList: packageList !== undefined ? packageList : undefined,
        originDoc: originDoc !== undefined ? originDoc : undefined,
        vehicleType: vehicleType !== undefined ? vehicleType : undefined,
        foreignVehicleCount: foreignVehicleCount !== undefined ? (foreignVehicleCount ? parseInt(foreignVehicleCount) : null) : undefined,
        mongolVehicleCount: mongolVehicleCount !== undefined ? (mongolVehicleCount ? parseInt(mongolVehicleCount) : null) : undefined,
        trailerType: trailerType !== undefined ? trailerType : undefined,
        hasContainer: hasContainer !== undefined ? hasContainer : undefined,
        containerNumber,
        invoiceSent: invoiceSent !== undefined ? invoiceSent : undefined,
        paymentReceived: paymentReceived !== undefined ? paymentReceived : undefined,
        idleTime: idleTime !== undefined ? idleTime : undefined,
        transportDone: transportDone !== undefined ? transportDone : undefined,
      },
      include: { company: true, order: true }
    });
    res.json(preOrder);
  } catch (error) {
    console.error('Update preorder error:', error);
    res.status(500).json({ error: 'Failed to update preorder', details: error.message });
  }
});

app.delete('/api/preorders/:id', async (req, res) => {
  try {
    await getPrisma().preOrder.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete preorder error:', error);
    res.status(500).json({ error: 'Failed to delete preorder', details: error.message });
  }
});

// PreOrder-оос Order үүсгэх
app.post('/api/preorders/:id/create-order', async (req, res) => {
  try {
    const preOrderId = parseInt(req.params.id);
    const { vehicleId } = req.body;
    
    console.log('Create order from preOrder:', { preOrderId, vehicleId });
    
    if (!vehicleId) return res.status(400).json({ error: 'Vehicle is required' });
    
    // Find preOrder
    const preOrder = await getPrisma().preOrder.findUnique({ where: { id: preOrderId } });
    if (!preOrder) {
      console.log('PreOrder not found:', preOrderId);
      return res.status(404).json({ error: 'PreOrder not found' });
    }
    
    console.log('Found preOrder:', preOrder);
    
    if (!preOrder.companyId) {
      console.log('PreOrder has no companyId:', preOrder);
      return res.status(400).json({ error: 'PreOrder must have a company' });
    }
    
    // Generate sequential order code
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    
    // Get the count of orders created today to generate sequential number
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const ordersToday = await getPrisma().order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    });
    
    const sequentialNumber = String(ordersToday + 1).padStart(4, '0');
    const code = `Achir-Bairon-${y}-${m}-${d}-${sequentialNumber}`;
    
    console.log('Generated order code:', code);
    
    // Create order from preOrder fields
    const order = await getPrisma().order.create({
      data: {
        code,
        companyId: preOrder.companyId,
        origin: preOrder.pickupAddress || '',
        destination: preOrder.deliveryAddress || '',
        vehicleId: parseInt(vehicleId),
        createdById: 1, // TODO: Replace with actual user id
        status: 'PENDING',
      },
      include: { company: true, vehicle: true }
    });
    
    console.log('Created order:', order);
    
    // Link preOrder to order
    await getPrisma().preOrder.update({ where: { id: preOrderId }, data: { orderId: order.id } });
    res.json(order);
  } catch (error) {
    console.error('PreOrder to Order error:', error);
    res.status(500).json({ error: 'Failed to create order from preOrder', details: error.message });
  }
});

module.exports = app;
