import { Router } from 'express';
import { prisma } from '../libs/prisma';

const router = Router();

// GET /api/devices - Get all devices
router.get('/', async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: {
        vehicles: true,
      },
    });
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// POST /api/devices - Create new device
router.post('/', async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Check if device already exists
    const existing = await prisma.device.findFirst({
      where: { deviceId },
    });

    if (existing) {
      return res.status(400).json({ error: 'Device with this ID already exists' });
    }

    const device = await prisma.device.create({
      data: { deviceId },
    });

    res.status(201).json(device);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// PUT /api/devices/:id - Update device
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { deviceId } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid device ID' });
    }

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Check if device exists
    const existingDevice = await prisma.device.findUnique({
      where: { id },
    });

    if (!existingDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check if new deviceId is already taken by another device
    const deviceIdConflict = await prisma.device.findFirst({
      where: {
        deviceId,
        id: { not: id },
      },
    });

    if (deviceIdConflict) {
      return res.status(400).json({ error: 'Device with this ID already exists' });
    }

    const device = await prisma.device.update({
      where: { id },
      data: { deviceId },
    });

    res.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// DELETE /api/devices/:id - Delete device
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid device ID' });
    }

    // Check if device exists
    const existingDevice = await prisma.device.findUnique({
      where: { id },
      include: {
        vehicles: true,
      },
    });

    if (!existingDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check if device is assigned to any vehicles
    if (existingDevice.vehicles.length > 0) {
      return res.status(400).json({ 
        error: `Cannot delete device assigned to ${existingDevice.vehicles.length} vehicle(s). Please unassign it first.` 
      });
    }

    await prisma.device.delete({
      where: { id },
    });

    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export { router as deviceRouter };
