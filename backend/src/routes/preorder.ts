import { Router } from 'express';
import { prisma } from '../libs/prisma';
import { requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Get all pre-orders (excluding those already converted to orders)
router.get('/', async (req, res) => {
  try {
    const requestingUser = req.user;
    
    // Build where clause - exclude pre-orders that have been converted to orders
    const whereClause: any = {
      orderId: null  // Only get pre-orders that haven't been converted to orders
    };
    
    // Filter by company for CLIENT_ADMIN
    if (requestingUser?.role === 'CLIENT_ADMIN' && requestingUser.companyId) {
      whereClause.companyId = requestingUser.companyId;
    }

    const preOrders = await prisma.preOrder.findMany({
      where: whereClause,
      include: {
        company: true,
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(preOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get pre-order by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const preOrder = await prisma.preOrder.findUnique({
      where: { id },
      include: {
        company: true,
        order: true,
      },
    });

    if (!preOrder) {
      return res.status(404).json({ error: 'Pre-order not found' });
    }

    res.json(preOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create pre-order
router.post('/', async (req, res) => {
  try {
    const {
      // Order Note
      companyId,
      pickupAddress,
      deliveryAddress,
      name,
      weight,
      dimension,
      // Order Price
      loadingCost,
      transportCost,
      transshipmentCost,
      exportCustomsCost,
      mongolTransportCost,
      importCustomsCost,
      profit,
      expense,
      totalAmount,
      // Teever
      invoice,
      packageList,
      originDoc,
      vehicleType,
      foreignVehicleCount,
      mongolVehicleCount,
      trailerType,
      hasContainer,
      containerNumber,
      // Tulbur - Төлбөр
      invoiceSent,
      paymentReceived,
      idleTime,
      transportDone,
      // Relations
      orderId,
    } = req.body;

    const preOrder = await prisma.preOrder.create({
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
      include: {
        company: true,
        order: true,
      },
    });

    res.status(201).json(preOrder);
  } catch (error: any) {
    console.error('Error creating pre-order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update pre-order
router.put('/:id', async (req, res) => {
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
      orderId,
    } = req.body;

    const preOrder = await prisma.preOrder.update({
      where: { id },
      data: {
        ...(companyId !== undefined && { companyId: companyId ? parseInt(companyId) : null }),
        ...(pickupAddress !== undefined && { pickupAddress }),
        ...(deliveryAddress !== undefined && { deliveryAddress }),
        ...(name !== undefined && { name }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(dimension !== undefined && { dimension }),
        ...(loadingCost !== undefined && { loadingCost: loadingCost ? parseFloat(loadingCost) : null }),
        ...(transportCost !== undefined && { transportCost: transportCost ? parseFloat(transportCost) : null }),
        ...(transshipmentCost !== undefined && { transshipmentCost: transshipmentCost ? parseFloat(transshipmentCost) : null }),
        ...(exportCustomsCost !== undefined && { exportCustomsCost: exportCustomsCost ? parseFloat(exportCustomsCost) : null }),
        ...(mongolTransportCost !== undefined && { mongolTransportCost: mongolTransportCost ? parseFloat(mongolTransportCost) : null }),
        ...(importCustomsCost !== undefined && { importCustomsCost: importCustomsCost ? parseFloat(importCustomsCost) : null }),
        ...(profit !== undefined && { profit: profit ? parseFloat(profit) : null }),
        ...(expense !== undefined && { expense: expense ? parseFloat(expense) : null }),
        ...(totalAmount !== undefined && { totalAmount: totalAmount ? parseFloat(totalAmount) : null }),
        ...(invoice !== undefined && { invoice }),
        ...(packageList !== undefined && { packageList }),
        ...(originDoc !== undefined && { originDoc }),
        ...(vehicleType !== undefined && { vehicleType }),
        ...(foreignVehicleCount !== undefined && { foreignVehicleCount: foreignVehicleCount ? parseInt(foreignVehicleCount) : null }),
        ...(mongolVehicleCount !== undefined && { mongolVehicleCount: mongolVehicleCount ? parseInt(mongolVehicleCount) : null }),
        ...(trailerType !== undefined && { trailerType }),
        ...(hasContainer !== undefined && { hasContainer }),
        ...(containerNumber !== undefined && { containerNumber }),
        ...(invoiceSent !== undefined && { invoiceSent }),
        ...(paymentReceived !== undefined && { paymentReceived }),
        ...(idleTime !== undefined && { idleTime }),
        ...(transportDone !== undefined && { transportDone }),
        ...(orderId !== undefined && { orderId: orderId ? parseInt(orderId) : null }),
      },
      include: {
        company: true,
        order: true,
      },
    });

    res.json(preOrder);
  } catch (error: any) {
    console.error('Error updating pre-order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete pre-order
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.preOrder.delete({
      where: { id },
    });
    res.json({ message: 'Pre-order deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create order from pre-order (Atomic transaction)
router.post('/:id/create-order', async (req, res) => {
  try {
    const preOrderId = parseInt(req.params.id);
    const { vehicleId } = req.body;
    const requestingUser = req.user;

    console.log('Create order from preOrder:', { preOrderId, vehicleId });

    if (!vehicleId) return res.status(400).json({ error: 'Vehicle is required' });

    // Find preOrder with company
    const preOrder = await prisma.preOrder.findUnique({ 
      where: { id: preOrderId },
      include: { company: true, order: true }
    });
    
    if (!preOrder) {
      console.log('PreOrder not found:', preOrderId);
      return res.status(404).json({ error: 'PreOrder not found' });
    }

    // Check if preOrder is already converted to an order
    if (preOrder.orderId || preOrder.order) {
      return res.status(400).json({ 
        error: 'Энэ урьдчилсан захиалга аль хэдийн захиалга болсон байна',
        existingOrderId: preOrder.orderId 
      });
    }

    // Check if vehicle is already assigned to an active order
    const vehicleIdInt = parseInt(vehicleId);
    const existingActiveOrder = await prisma.order.findFirst({
      where: {
        vehicleId: vehicleIdInt,
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      },
      include: { company: true }
    });

    if (existingActiveOrder) {
      return res.status(400).json({ 
        error: `Энэ машин "${existingActiveOrder.company?.name || ''}" компанийн идэвхтэй захиалгад оноогдсон байна. Машин суллагдсан (захиалга дууссан/цуцлагдсан) үед дахин оноох боломжтой.`,
        existingOrderId: existingActiveOrder.id,
        existingOrderCode: existingActiveOrder.code
      });
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

    const ordersToday = await prisma.order.count({
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

    // Use transaction to ensure atomicity - either all changes succeed or none
    const orderWithPreOrders = await prisma.$transaction(async (tx) => {
      // Create order from preOrder fields with all relevant data
      const order = await tx.order.create({
        data: {
          code,
          companyId: preOrder.companyId!,  // companyId is validated above
          origin: preOrder.pickupAddress || '',
          destination: preOrder.deliveryAddress || '',
          vehicleId: vehicleIdInt,
          createdById: requestingUser?.id || 1,
          status: 'PENDING',
        },
        include: { 
          company: true, 
          vehicle: true,
          createdBy: true,
          assignedTo: true
        }
      });

      console.log('Created order:', order);

      // Link preOrder to order - this marks it as converted
      await tx.preOrder.update({ 
        where: { id: preOrderId }, 
        data: { orderId: order.id }
      });

      // Return order with preOrders included
      return await tx.order.findUnique({
        where: { id: order.id },
        include: {
          company: true,
          vehicle: true,
          createdBy: true,
          assignedTo: true,
          preOrders: true
        }
      });
    });

    res.json(orderWithPreOrders);
  } catch (error: any) {
    console.error('PreOrder to Order error:', error);
    res.status(500).json({ error: 'Failed to create order from preOrder', details: error.message });
  }
});

export const preOrderRouter = router;
