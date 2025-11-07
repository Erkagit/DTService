import { Request, Response } from 'express';
import { OrderStatus, Role } from '@prisma/client';
import { prisma } from '../../libs/prisma';

function userFromReq(req: Request) {
  return {
    id: Number(req.headers['x-user-id'] ?? 1),
    role: (req.headers['x-user-role'] as Role) ?? Role.ADMIN,
    companyId: req.headers['x-company-id'] ? Number(req.headers['x-company-id']) : undefined
  };
}

export async function list(req: Request, res: Response) {
  try {
    const user = userFromReq(req);
    const statusFilter = (req.query.status as string) || 'active';
    const companyIdQ = req.query.companyId ? Number(req.query.companyId) : undefined;

    const where: any = {};
    if (user.role === Role.CLIENT_ADMIN) where.companyId = user.companyId ?? null;
    else if (companyIdQ) where.companyId = companyIdQ;
    
    if (statusFilter === 'active') {
      where.status = { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] };
    } else if (statusFilter === 'finished') {
      where.status = { in: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        vehicle: { include: { pings: { orderBy: { at: 'desc' }, take: 1 } } },
        company: true,
        assignedTo: { select: { id: true, name: true, email: true } }
      },
      orderBy: [{ createdAt: 'desc' }]
    });

    res.json(orders);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        vehicle: true,
        company: true,
      }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.LOADING, OrderStatus.CANCELLED],
  [OrderStatus.LOADING]: [OrderStatus.IN_TRANSIT, OrderStatus.TRANSFER_LOADING, OrderStatus.CANCELLED],
  [OrderStatus.TRANSFER_LOADING]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.CN_EXPORT_CUSTOMS]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.MN_IMPORT_CUSTOMS]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.ARRIVED_AT_SITE, OrderStatus.TRANSFER_LOADING, OrderStatus.CANCELLED],
  [OrderStatus.ARRIVED_AT_SITE]: [OrderStatus.UNLOADED],
  [OrderStatus.UNLOADED]: [OrderStatus.COMPLETED, OrderStatus.RETURN_TRIP],
  [OrderStatus.RETURN_TRIP]: [OrderStatus.MN_EXPORT_RETURN, OrderStatus.CN_IMPORT_RETURN, OrderStatus.COMPLETED],
  [OrderStatus.MN_EXPORT_RETURN]: [OrderStatus.CN_IMPORT_RETURN, OrderStatus.COMPLETED],
  [OrderStatus.CN_IMPORT_RETURN]: [OrderStatus.COMPLETED],
  [OrderStatus.TRANSFER]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

export async function updateStatus(req: Request, res: Response) {
  try {
    const user = userFromReq(req);
    const id = Number(req.params.id);
    const { status, note } = req.body as { status: OrderStatus; note?: string };

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (user.role === Role.CLIENT_ADMIN) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const allowed = ALLOWED[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Illegal transition: ${order.status} -> ${status}` });
    }

    const data: any = { status };

    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.order.update({ where: { id }, data });
      await tx.orderStatusHistory.create({
        data: { orderId: id, status, note }
      });
      return up;
    });

    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
