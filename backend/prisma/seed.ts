import { PrismaClient, Role, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Companies
  const acme = await prisma.company.create({
    data: { name: 'Demo Logistics' },
  });

  const erka = await prisma.company.create({
    data: { name: 'Erka Transport' },
  });

  console.log('✅ Companies created:', { acme, erka });

  // Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dts.local',
      name: 'Admin',
      role: Role.ADMIN,
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: 'op@dts.local',
      name: 'Operator',
      role: Role.OPERATOR,
    },
  });

  const clientAdmin = await prisma.user.create({
    data: {
      email: 'client@acme.local',
      name: 'Client Admin',
      role: Role.CLIENT_ADMIN,
      companyId: acme.id,
    },
  });

  console.log('✅ Users created:', { admin, operator, clientAdmin });

  // Devices
  const device1 = await prisma.device.create({
    data: { deviceId: 'GPS-0001' },
  });

  const device2 = await prisma.device.create({
    data: { deviceId: 'GPS-0002' },
  });

  console.log('✅ Devices created:', { device1, device2 });

  // Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      plateNo: 'UBX-1234',
      driverName: 'Батаа',
      driverPhone: '+976-99001122',
      deviceId: device1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      plateNo: 'UBX-5678',
      driverName: 'Дорж',
      driverPhone: '+976-88003344',
      deviceId: device2.id,
    },
  });

  console.log('✅ Vehicles created:', { vehicle1, vehicle2 });

  // Orders
  const order1 = await prisma.order.create({
    data: {
      code: 'DTS-2025-0001',
      companyId: acme.id,
      origin: 'Ulaanbaatar',
      destination: 'Zamyn-Uud',
      vehicleId: vehicle1.id,
      status: OrderStatus.PENDING,
      createdById: admin.id,
      assignedToId: operator.id,
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order1.id,
      status: order1.status,
      note: 'Order created',
    },
  });

  console.log('✅ Order created:', { order1 });

  // GPS Pings
  await prisma.locationPing.create({
    data: {
      vehicleId: vehicle1.id,
      lat: 47.9184,
      lng: 106.9177,
      heading: 180,
    },
  });

  console.log('✅ GPS ping created');
  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

