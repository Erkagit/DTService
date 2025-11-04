import { Router } from 'express';
import { prisma } from '../../libs/prisma';

const router = Router();

/**
 * GET /api/v1/telemetry/latest
 *  -> Тээврийн хэрэгсэл бүрийн хамгийн сүүлийн GPS пинг-г буцаана
 */
router.get('/latest', async (_req, res) => {
  try {
    const latest = await prisma.locationPing.groupBy({
      by: ['vehicleId'],
      _max: { at: true },
    });

    const results = await Promise.all(
      latest.map(async (g) =>
        prisma.locationPing.findFirst({
          where: { vehicleId: g.vehicleId },
          orderBy: { at: 'desc' },
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                plateNo: true,
                device: { select: { deviceId: true } },
              },
            },
          },
        })
      )
    );

    res.json(results.filter(Boolean));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/v1/telemetry/vehicle/:id
 *  -> Тухайн vehicle-ийн сүүлийн 50 пинг-г буцаана
 */
router.get('/vehicle/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await prisma.locationPing.findMany({
      where: { vehicleId: id },
      orderBy: { at: 'desc' },
      take: 50,
    });
    res.json(rows.reverse());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/v1/telemetry/ping
 *  -> GPS төхөөрөмжөөс ирсэн пинг-г бүртгэнэ
 */
router.post('/ping', async (req, res) => {
  try {
    const { deviceId, lat, lng, speedKph } = req.body;

    if (!deviceId || !lat || !lng) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await prisma.device.findUnique({ where: { deviceId } });
    if (!device)
      return res.status(404).json({ error: `Device ${deviceId} not found` });

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: device.id },
    });

    if (!vehicle)
      return res
        .status(404)
        .json({ error: `No vehicle attached to device ${deviceId}` });

    const ping = await prisma.locationPing.create({
      data: {
        vehicleId: vehicle.id,
        lat,
        lng,
        speedKph,
      },
    });

    res.json(ping);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
