// src/app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient, Prisma, OrderStatus } from "@prisma/client";

dotenv.config();

export const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// ——— helper: async error wrapper
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ——— health
app.get("/health", (_req, res) => res.json({ ok: true, service: "dts-backend" }));

// TEMP: Prisma models diagnostic
app.get("/__diag", (_req, res) => {
  // Prisma-н дотоод DMMF-ээс моделийн нэрсийг уншина
  // @ts-ignore
  const models = prisma?._dmmf?.datamodel?.models?.map(m => m.name) ?? [];
  res.json({ models });
});

// --- Devices ---
app.get("/api/devices", ah(async (_req, res) => {
  const rows = await prisma.device.findMany({ orderBy: { id: "asc" } });
  res.json(rows);
}));

// --- Vehicles ---
app.post("/api/vehicles", ah(async (req, res) => {
  const { name, plateNo, deviceId } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  try {
    const v = await prisma.vehicle.create({
      data: { name, plateNo, deviceId }
    });
    res.status(201).json(v);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return res.status(409).json({ error: "plateNo or device already in use" });
      if (e.code === "P2003") return res.status(400).json({ error: "deviceId not found" }); // FK fail
    }
    throw e;
  }
}));

app.get("/api/vehicles", ah(async (_req, res) => {
  const rows = await prisma.vehicle.findMany({
    include: { device: true, pings: { take: 1, orderBy: { at: "desc" } } },
    orderBy: { id: "asc" }
  });
  res.json(rows);
}));

// --- Orders ---
app.post("/api/orders", ah(async (req, res) => {
  const { code, origin, destination, vehicleId } = req.body || {};
  if (!code || !origin || !destination) {
    return res.status(400).json({ error: "code, origin, destination are required" });
  }
  try {
    const o = await prisma.order.create({
      data: { code, origin, destination, vehicleId }
    });
    await prisma.orderStatusHistory.create({
      data: { orderId: o.id, status: o.status, note: "Created" }
    });
    res.status(201).json(o);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return res.status(409).json({ error: "code already exists" });
      if (e.code === "P2003") return res.status(400).json({ error: "vehicleId not found" });
    }
    throw e;
  }
}));

app.get("/api/orders", ah(async (_req, res) => {
  const rows = await prisma.order.findMany({
    include: {
      vehicle: { include: { device: true } },
      histories: { orderBy: { at: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(rows);
}));

// статус шинэчлэх (PRD lifecycle)
app.patch("/api/orders/:id/status", ah(async (req, res) => {
  const id = Number(req.params.id);
  const { status, note } = req.body || {};
  if (!Object.values(OrderStatus).includes(status)) {
    return res.status(422).json({ error: "Invalid status", allowed: Object.values(OrderStatus) });
  }
  const o = await prisma.order.update({ where: { id }, data: { status } });
  await prisma.orderStatusHistory.create({ data: { orderId: id, status, note } });
  res.json(o);
}));

// GPS ping write (device → vehicle → ping)
app.post("/api/vehicles/:id/ping", ah(async (req, res) => {
  const vehicleId = Number(req.params.id);
  const { lat, lng, speedKph, heading } = req.body || {};
  if (lat == null || lng == null) return res.status(400).json({ error: "lat, lng required" });
  const ping = await prisma.locationPing.create({
    data: { vehicleId, lat, lng, speedKph, heading }
  });
  res.status(201).json(ping);
}));

// ——— Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
