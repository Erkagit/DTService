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
