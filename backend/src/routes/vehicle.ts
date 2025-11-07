import { Router } from 'express';
import { prisma } from '../libs/prisma';

const router = Router();

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        device: true,
        pings: {
          take: 1,
          orderBy: { at: 'desc' },
        },
      },
    });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// POST /api/vehicles
router.post('/', async (req, res) => {
  try {
    const { plateNo, driverName, driverPhone, deviceId } = req.body;

    if (!plateNo || !driverName || !driverPhone) {
      return res.status(400).json({ error: 'plateNo, driverName, and driverPhone are required' });
    }

    // Check if device exists
    if (deviceId) {
      const device = await prisma.device.findUnique({
        where: { id: parseInt(deviceId) },
      });
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNo,
        driverName,
        driverPhone,
        deviceId: deviceId ? parseInt(deviceId) : null,
      },
      include: {
        device: true,
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);
    const { plateNo, driverName, driverPhone, deviceId } = req.body;

    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: 'Invalid vehicle ID' });
    }

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check if device exists
    if (deviceId !== undefined && deviceId !== null && deviceId !== '') {
      const device = await prisma.device.findUnique({
        where: { id: parseInt(deviceId) },
      });
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...(plateNo && { plateNo }),
        ...(driverName && { driverName }),
        ...(driverPhone && { driverPhone }),
        ...(deviceId !== undefined && { 
          deviceId: deviceId ? parseInt(deviceId) : null 
        }),
      },
      include: {
        device: true,
      },
    });

    res.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);

    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: 'Invalid vehicle ID' });
    }

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        _count: {
          select: {
            orders: true,
            pings: true,
          },
        },
      },
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Delete associated pings first
    if (existingVehicle._count.pings > 0) {
      await prisma.locationPing.deleteMany({
        where: { vehicleId },
      });
    }

    // Check if vehicle has active orders
    if (existingVehicle._count.orders > 0) {
      // Update orders to remove vehicle reference instead of blocking deletion
      await prisma.order.updateMany({
        where: { vehicleId },
        data: { vehicleId: null },
      });
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// POST /api/vehicles/:id/ping
router.post('/:id/ping', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);
    const { lat, lng, speedKph, heading } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const ping = await prisma.locationPing.create({
      data: {
        vehicleId,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        heading: heading ? parseFloat(heading) : null,
      },
    });

    res.status(201).json(ping);
  } catch (error) {
    console.error('Error creating ping:', error);
    res.status(500).json({ error: 'Failed to create ping' });
  }
});

export { router as vehicleRouter };
