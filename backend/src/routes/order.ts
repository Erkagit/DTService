import { Router } from 'express';
import { prisma } from '../libs/prisma';
import { requireRole } from '../middleware/auth';
import { Role, OrderStatus } from '@prisma/client';

const router = Router();

// Allowed status transitions - Sequential workflow with cancel option at each step
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.LOADING, OrderStatus.CANCELLED],
  LOADING: [OrderStatus.TRANSFER_LOADING, OrderStatus.CANCELLED],
  TRANSFER_LOADING: [OrderStatus.CN_EXPORT_CUSTOMS, OrderStatus.CANCELLED],
  CN_EXPORT_CUSTOMS: [OrderStatus.MN_IMPORT_CUSTOMS, OrderStatus.CANCELLED],
  MN_IMPORT_CUSTOMS: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  IN_TRANSIT: [OrderStatus.ARRIVED_AT_SITE, OrderStatus.CANCELLED],
  ARRIVED_AT_SITE: [OrderStatus.UNLOADED, OrderStatus.CANCELLED],
  UNLOADED: [OrderStatus.RETURN_TRIP, OrderStatus.CANCELLED],
  RETURN_TRIP: [OrderStatus.MN_EXPORT_RETURN, OrderStatus.CANCELLED],
  MN_EXPORT_RETURN: [OrderStatus.CN_IMPORT_RETURN, OrderStatus.CANCELLED],
  CN_IMPORT_RETURN: [OrderStatus.TRANSFER, OrderStatus.CANCELLED],
  TRANSFER: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: []
};

// Helper function to get previous status in the workflow
const getPreviousStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const statusOrder: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.LOADING,
    OrderStatus.TRANSFER_LOADING,
    OrderStatus.CN_EXPORT_CUSTOMS,
    OrderStatus.MN_IMPORT_CUSTOMS,
    OrderStatus.IN_TRANSIT,
    OrderStatus.ARRIVED_AT_SITE,
    OrderStatus.UNLOADED,
    OrderStatus.RETURN_TRIP,
    OrderStatus.MN_EXPORT_RETURN,
    OrderStatus.CN_IMPORT_RETURN,
    OrderStatus.TRANSFER,
    OrderStatus.COMPLETED
  ];
  
  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex <= 0) return null;
  return statusOrder[currentIndex - 1];
};

// Helper function to check if status transition is valid
const isValidTransition = (fromStatus: OrderStatus, toStatus: OrderStatus): boolean => {
  // Can't change from COMPLETED or CANCELLED
  if (fromStatus === OrderStatus.COMPLETED || fromStatus === OrderStatus.CANCELLED) {
    return false;
  }
  
  // Can always go to CANCELLED (except from COMPLETED)
  if (toStatus === OrderStatus.CANCELLED) {
    return true;
  }
  
  // Check if it's a forward transition
  const allowedForward = ALLOWED_TRANSITIONS[fromStatus] || [];
  if (allowedForward.includes(toStatus)) {
    return true;
  }
  
  // Check if it's a backward transition (one step back)
  const previousStatus = getPreviousStatus(fromStatus);
  if (previousStatus && previousStatus === toStatus) {
    return true;
  }
  
  return false;
};

// Basic CRUD operations for orders
router.get('/', async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        vehicle: true,
        company: true,
        createdBy: true,
        assignedTo: true
      }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        vehicle: true,
        company: true,
        createdBy: true,
        assignedTo: true
      }
    });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code, companyId, origin, destination, vehicleId, createdById, assignedToId } = req.body;
    
    // Validation
    if (!code || !origin || !destination || !companyId || !createdById) {
      return res.status(400).json({ 
        error: 'Missing required fields: code, origin, destination, companyId, and createdById are required' 
      });
    }

    const order = await prisma.order.create({
      data: {
        code,
        companyId: parseInt(companyId),
        origin,
        destination,
        vehicleId: vehicleId ? parseInt(vehicleId) : null,
        createdById: parseInt(createdById),
        assignedToId: assignedToId ? parseInt(assignedToId) : null
      },
      include: {
        vehicle: true,
        company: true,
        createdBy: true,
        assignedTo: true
      }
    });
    res.json(order);
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { code, origin, destination, vehicleId, status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate status if provided
    if (status && !Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${Object.values(OrderStatus).join(', ')}` 
      });
    }

    // Validate status transition if status is being changed
    if (status && status !== existingOrder.status) {
      if (!isValidTransition(existingOrder.status as OrderStatus, status)) {
        const allowedStatuses = ALLOWED_TRANSITIONS[existingOrder.status as OrderStatus] || [];
        const previousStatus = getPreviousStatus(existingOrder.status as OrderStatus);
        const allAllowed = [...allowedStatuses];
        if (previousStatus) allAllowed.push(previousStatus);
        
        return res.status(400).json({ 
          error: `Invalid status transition from ${existingOrder.status} to ${status}. Allowed transitions: ${allAllowed.join(', ')}` 
        });
      }
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(code && { code }),
        ...(origin && { origin }),
        ...(destination && { destination }),
        ...(vehicleId !== undefined && { vehicleId: vehicleId ? parseInt(vehicleId) : null }),
        ...(status && { status }),
        updatedAt: new Date()
      },
      include: {
        vehicle: true,
        company: true,
        createdBy: true,
        assignedTo: true
      }
    });

    res.json(order);
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete order (Admin only)
router.delete('/:id', requireRole(Role.ADMIN), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete order history entries first
    await prisma.orderStatusHistory.deleteMany({
      where: { orderId }
    });

    // Then delete the order
    await prisma.order.delete({
      where: { id: orderId }
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Admin only)
router.patch('/:id/status', requireRole(Role.ADMIN), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, note } = req.body;
    const requestingUser = req.user;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status is a valid OrderStatus
    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${Object.values(OrderStatus).join(', ')}` 
      });
    }

    // Get the current order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate status transition
    if (!isValidTransition(order.status as OrderStatus, status)) {
      const allowedStatuses = ALLOWED_TRANSITIONS[order.status as OrderStatus] || [];
      const previousStatus = getPreviousStatus(order.status as OrderStatus);
      const allAllowed = [...allowedStatuses];
      if (previousStatus) allAllowed.push(previousStatus);
      
      return res.status(400).json({ 
        error: `Invalid status transition from ${order.status} to ${status}. Allowed transitions: ${allAllowed.join(', ')}` 
      });
    }

    // Update order status and create history entry in a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update the order
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { 
          status,
          updatedAt: new Date()
        },
        include: {
          vehicle: true,
          company: true,
          createdBy: true,
          assignedTo: true
        }
      });

      // Create status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          note: note || `Status updated by ${requestingUser?.email || 'system'}`
        }
      });

      return updated;
    });

    res.json(updatedOrder);
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order status history
router.get('/:id/history', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as orderRouter };
