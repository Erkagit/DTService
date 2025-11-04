import { PrismaClient, Role, OrderStatus } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // company
  const acme = await prisma.company.upsert({
    where: { name: 'Demo Logistics' },
    update: {},
    create: { name: 'Demo Logistics' },
  })

  // users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dts.local' },
    update: {},
    create: { email: 'admin@dts.local', name: 'Admin', role: Role.ADMIN },
  })

  const operator = await prisma.user.upsert({
    where: { email: 'op@dts.local' },
    update: {},
    create: { email: 'op@dts.local', name: 'Operator', role: Role.OPERATOR },
  })

  const clientAdmin = await prisma.user.upsert({
    where: { email: 'client@acme.local' },
    update: {},
    create: { email: 'client@acme.local', name: 'Client Admin', role: Role.CLIENT_ADMIN, companyId: acme.id },
  })

  // vehicle + device
  const device = await prisma.device.create({ data: { deviceId: 'GPS-0001' } })
  const vehicle = await prisma.vehicle.create({
    data: { name: 'Hino 1', plateNo: 'UBX-1234', deviceId: device.id }
  })

  // sample order
  const order = await prisma.order.create({
    data: {
      code: 'DTS-2025-0001',
      companyId: acme.id,
      origin: 'Ulaanbaatar',
      destination: 'Zamyn-Uud',
      vehicleId: vehicle.id,
      status: OrderStatus.PENDING,
      createdById: admin.id,
      assignedToId: operator.id,
    }
  })

  console.log({ acme, admin, operator, clientAdmin, order })
}

main().finally(() => prisma.$disconnect())
