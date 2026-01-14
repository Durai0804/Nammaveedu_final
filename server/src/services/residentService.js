const prisma = require('../prisma/client');

async function getResidentDashboard(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const resident = await prisma.resident.findUnique({ where: { userId: user.id }, include: { flat: true } });
  if (!resident) throw Object.assign(new Error('Resident profile not found'), { status: 404 });

  const flat = resident.flat;

  const [maintenance, complaints, visitorsToday, preApprovals] = await Promise.all([
    prisma.maintenance.findMany({ where: { flatId: flat.id }, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.complaint.findMany({ where: { OR: [{ flatId: flat.id }, { flatNumber: flat.flatNumber }] }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.visitor.findMany({
      where: {
        flatId: flat.id,
        date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.preApproval.findMany({ where: { createdById: user.id } }),
  ]);

  const stats = {
    maintenanceDue: maintenance.find(m => m.status === 'pending') ? true : false,
    complaintsOpen: complaints.filter(c => c.status !== 'RESOLVED').length,
    visitorsToday: visitorsToday.length,
    preApprovals: preApprovals.length,
  };

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, flatNumber: user.flatNumber },
    flat,
    stats,
    maintenance,
    complaints,
    visitorsToday,
    preApprovals,
  };
}

module.exports = { getResidentDashboard };
