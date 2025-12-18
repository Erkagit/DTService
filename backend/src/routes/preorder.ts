import { Router } from 'express';
import { prisma } from '../libs/prisma';
import { requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Get all pre-orders
router.get('/', async (_req, res) => {
  try {
    const preOrders = await prisma.preOrder.findMany({
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

export const preOrderRouter = router;
