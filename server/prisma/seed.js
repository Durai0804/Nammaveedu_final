const { PrismaClient, Role, ComplaintStatus, NoticeStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Clear in dev (idempotent-ish)
  await prisma.comment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.preApproval.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.flat.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const adminPassword = await bcrypt.hash('admin@123', 10);
  const residentPassword = await bcrypt.hash('resident@123', 10);
  const resident2Password = await bcrypt.hash('resident2@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nammaveedu.in',
      password: adminPassword,
      name: 'Community Admin',
      role: Role.ADMIN,
    },
  });

  // Super Admin (full access)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'chairmadurai0804@gmail.com' },
    update: {},
    create: {
      email: 'chairmadurai0804@gmail.com',
      password: await bcrypt.hash('Rasukutty0804', 10),
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
    },
  });

  const resident = await prisma.user.create({
    data: {
      email: 'rajesh.kumar@example.com',
      password: residentPassword,
      name: 'Rajesh Kumar',
      role: Role.RESIDENT,
      flatNumber: 'A-101',
    },
  });

  const resident2 = await prisma.user.create({
    data: {
      email: 'meena.iyer@example.com',
      password: resident2Password,
      name: 'Meena Iyer',
      role: Role.RESIDENT,
      flatNumber: 'A-202',
    },
  });

  // Flats (Chennai themed)
  const flatA101 = await prisma.flat.create({
    data: {
      flatNumber: 'A-101',
      block: 'A',
      floor: '1st Floor',
      sqft: 1200,
      ownerName: 'Rajesh Kumar',
    },
  });
  const flatA102 = await prisma.flat.create({
    data: { flatNumber: 'A-102', block: 'A', floor: '1st Floor', sqft: 1180, ownerName: 'Priya Narayanan' },
  });
  const flatA202 = await prisma.flat.create({
    data: { flatNumber: 'A-202', block: 'A', floor: '2nd Floor', sqft: 1350, ownerName: 'Meena Iyer' },
  });

  // Resident record links user->flat
  await prisma.resident.create({
    data: {
      userId: resident.id,
      flatId: flatA101.id,
      phone: '+91 98765 43210',
      members: 4,
    },
  });

  await prisma.resident.create({
    data: {
      userId: resident2.id,
      flatId: flatA202.id,
      phone: '+91 98842 22229',
      members: 3,
    },
  });

  // Notices (events in Chennai society)
  const notices = await prisma.notice.createMany({
    data: [
      {
        title: 'Annual General Meeting',
        description: 'AGM at Clubhouse Hall. Agenda: Budget, Maintenance, New Facilities.',
        status: NoticeStatus.UPCOMING,
        date: new Date('2026-01-15T10:00:00+05:30'),
        time: '10:00 AM',
        location: 'Clubhouse, Block A',
      },
      {
        title: 'Pongal Celebration',
        description: 'Traditional Pongal event with kolam competition and prasadam.',
        status: NoticeStatus.ONGOING,
        date: new Date(),
        time: '6:00 PM',
        location: 'Central Courtyard',
      },
      {
        title: 'Water Tank Cleaning',
        description: 'Scheduled cleaning on Jan 12. Water supply intermittent 9 AM - 2 PM.',
        status: NoticeStatus.COMPLETED,
        date: new Date('2026-01-12T09:00:00+05:30'),
        time: '9:00 AM',
        location: 'All Blocks',
      },
    ],
  });

  // Maintenance entries
  await prisma.maintenance.createMany({
    data: [
      { flatId: flatA101.id, month: 'Jan 2026', amount: 5000, status: 'paid', paidAt: new Date('2026-01-05') },
      { flatId: flatA101.id, month: 'Feb 2026', amount: 5000, status: 'pending' },
      { flatId: flatA102.id, month: 'Jan 2026', amount: 4800, status: 'paid', paidAt: new Date('2026-01-03') },
      { flatId: flatA202.id, month: 'Jan 2026', amount: 5200, status: 'paid', paidAt: new Date('2026-01-06') },
      { flatId: flatA202.id, month: 'Feb 2026', amount: 5200, status: 'pending' },
    ],
  });

  // Visitors today
  const today = new Date();
  const todayISO = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  await prisma.visitor.createMany({
    data: [
      { flatId: flatA101.id, name: 'Swiggy Delivery', purpose: 'Delivery', date: todayISO, inTime: '18:10', outTime: '18:18', status: 'out' },
      { flatId: flatA101.id, name: 'Electrician', purpose: 'Service', date: todayISO, inTime: '15:00', outTime: '16:10', status: 'out' },
      { flatId: flatA102.id, name: 'Amazon Delivery', purpose: 'Delivery', date: todayISO, inTime: '11:35', outTime: '-', status: 'in' },
      { flatId: flatA202.id, name: 'Milk Delivery', purpose: 'Delivery', date: todayISO, inTime: '06:30', outTime: '06:32', status: 'out' },
      { flatId: flatA202.id, name: 'Housekeeping', purpose: 'Service', date: todayISO, inTime: '10:00', outTime: '-', status: 'in' },
    ],
  });

  // Pre-approvals
  await prisma.preApproval.createMany({
    data: [
      { createdById: resident.id, flatNumber: 'A-101', name: 'Mr. Srinivasan', purpose: 'Guest', expectedTime: '07:00 PM' },
      { createdById: resident.id, flatNumber: 'A-101', name: 'Zomato Delivery', purpose: 'Delivery', expectedTime: 'Anytime' },
      { createdById: resident2.id, flatNumber: 'A-202', name: 'Lakshmi', purpose: 'Guest', expectedTime: '05:30 PM' },
    ],
  });

  // Complaints and comments
  const comp = await prisma.complaint.create({
    data: {
      flatNumber: 'A-101',
      description: 'Leakage in bathroom sink. Needs urgent fix.',
      status: ComplaintStatus.IN_PROGRESS,
      createdById: resident.id,
    },
  });
  await prisma.comment.create({
    data: {
      complaintId: comp.id,
      authorId: admin.id,
      text: 'Assigned plumber. Will visit between 5-6 PM.',
    },
  });

  const comp2 = await prisma.complaint.create({
    data: {
      flatNumber: 'A-202',
      description: 'Intercom not working properly in living room.',
      status: ComplaintStatus.OPEN,
      createdById: resident2.id,
    },
  });

  // Additional sample residents dataset
  const extraResidents = [
    { name: 'Durai',  email: 'durai@example.com',  phone: '+91 98941 00001' },
    { name: 'Hemesh', email: 'hemesh@example.com', phone: '+91 98941 00002' },
    { name: 'Karthi', email: 'karthi@example.com', phone: '+91 98941 00003' },
    { name: 'Nixon',  email: 'nixon@example.com',  phone: '+91 98941 00004' },
    { name: 'Prince', email: 'prince@example.com', phone: '+91 98941 00005' },
    { name: 'Sam',    email: 'sam@example.com',    phone: '+91 98941 00006' },
  ];
  let flatCounter = 301; // Start from A-301
  for (const person of extraResidents) {
    const user = await prisma.user.create({
      data: {
        email: person.email,
        password: await bcrypt.hash('resident@123', 10),
        name: person.name,
        role: Role.RESIDENT,
        flatNumber: `A-${flatCounter}`,
      },
    });

    const flat = await prisma.flat.create({
      data: {
        flatNumber: `A-${flatCounter}`,
        block: 'A',
        floor: `${String(Math.floor(flatCounter / 100))}rd Floor`,
        sqft: 1100 + ((flatCounter % 5) * 50),
        ownerName: person.name,
      },
    });

    await prisma.resident.create({
      data: {
        userId: user.id,
        flatId: flat.id,
        phone: person.phone,
        members: 2 + (flatCounter % 3),
      },
    });

    await prisma.maintenance.createMany({
      data: [
        { flatId: flat.id, month: 'Jan 2026', amount: 5000, status: 'paid', paidAt: new Date('2026-01-04') },
        { flatId: flat.id, month: 'Feb 2026', amount: 5000, status: (flatCounter % 2 === 0) ? 'paid' : 'pending', paidAt: (flatCounter % 2 === 0) ? new Date('2026-02-05') : null },
      ],
    });

    await prisma.visitor.create({
      data: { flatId: flat.id, name: 'Courier Delivery', purpose: 'Delivery', date: new Date(new Date().setHours(0,0,0,0)), inTime: '12:10', outTime: '12:15', status: 'out' },
    });

    await prisma.complaint.create({
      data: {
        flatNumber: flat.flatNumber,
        description: 'Common area light flickering near staircase.',
        status: ComplaintStatus.OPEN,
        createdById: user.id,
      },
    });

    flatCounter += 1;
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
