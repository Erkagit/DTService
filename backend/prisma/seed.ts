import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed with JWT authentication...\n');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Companies
  console.log('Creating companies...');
  const acme = await prisma.company.create({
    data: { name: 'Demo Logistics' },
  });

  const erka = await prisma.company.create({
    data: { name: 'Erka Transport' },
  });

  console.log('✅ Companies:', acme.name, erka.name);

  // Users with passwords
  console.log('\nCreating users with passwords...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dts.local',
      name: 'Admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const clientAdmin = await prisma.user.create({
    data: {
      email: 'client@acme.local',
      name: 'Client Admin',
      password: hashedPassword,
      role: Role.CLIENT_ADMIN,
      companyId: acme.id,
    },
  });

  console.log('✅ Users:', admin.email, clientAdmin.email);

  // Devices
  console.log('\nCreating devices...');
  const device1 = await prisma.device.create({ data: { deviceId: 'GPS-0001' } });
  const device2 = await prisma.device.create({ data: { deviceId: 'GPS-0002' } });
  const device3 = await prisma.device.create({ data: { deviceId: 'GPS-0003' } });

  console.log('✅ Devices:', device1.deviceId, device2.deviceId, device3.deviceId);

  // Vehicles
  console.log('\nCreating vehicles...');
  const vehicle1 = await prisma.vehicle.create({
    data: {
      plateNo: 'УНД-8701',
      driverName: 'Батаа',
      driverPhone: '+976-99001122',
      deviceId: device1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      plateNo: 'УБХ-5678',
      driverName: 'Дорж',
      driverPhone: '+976-88003344',
      deviceId: device2.id,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      plateNo: 'УНД-1234',
      driverName: 'Төмөр',
      driverPhone: '+976-77005566',
      deviceId: device3.id,
    },
  });

  console.log('✅ Vehicles:', vehicle1.plateNo, vehicle2.plateNo, vehicle3.plateNo);

  // Orders
  console.log('\nCreating orders...');
  
  const order1 = await prisma.order.create({
    data: {
      code: 'Achir Bayron LLC-2025-0001',
      companyId: acme.id,
      origin: 'Ulaanbaatar',
      destination: 'Zamyn-Uud',
      vehicleId: vehicle1.id,
      status: OrderStatus.IN_TRANSIT,
      createdById: admin.id,
      assignedToId: admin.id,
    },
  });

  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: order1.id, status: OrderStatus.PENDING, note: 'Order created' },
      { orderId: order1.id, status: OrderStatus.LOADING, note: 'Started loading' },
      { orderId: order1.id, status: OrderStatus.CN_EXPORT_CUSTOMS, note: 'China export customs' },
      { orderId: order1.id, status: OrderStatus.MN_IMPORT_CUSTOMS, note: 'Mongolia import customs' },
      { orderId: order1.id, status: OrderStatus.IN_TRANSIT, note: 'On the way' },
    ],
  });

  const order2 = await prisma.order.create({
    data: {
      code: 'Achir Bayron LLC-2025-0002',
      companyId: erka.id,
      origin: 'Darkhan',
      destination: 'Erdenet',
      vehicleId: vehicle2.id,
      status: OrderStatus.LOADING,
      createdById: admin.id,
      assignedToId: admin.id,
    },
  });

  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: order2.id, status: OrderStatus.PENDING, note: 'Created' },
      { orderId: order2.id, status: OrderStatus.LOADING, note: 'Loading' },
    ],
  });

  console.log('✅ Orders:', order1.code, order2.code);

  // GPS Pings
  console.log('\nCreating GPS pings...');
  await prisma.locationPing.createMany({
    data: [
      { vehicleId: vehicle1.id, lat: 47.9184, lng: 106.9177, speedKph: 65.5, heading: 180 },
      { vehicleId: vehicle2.id, lat: 49.4671, lng: 104.0448, speedKph: 45.0, heading: 90 },
      { vehicleId: vehicle3.id, lat: 43.6532, lng: 111.8251, speedKph: 0, heading: 0 },
    ],
  });

  console.log('✅ GPS pings created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('🔐 Login credentials (password: password123):');
  console.log('  - admin@dts.local (Admin)');
  console.log('  - client@acme.local (Client Admin)\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });