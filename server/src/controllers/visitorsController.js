const prisma = require('../prisma/client');
const { z } = require('zod');

const createVisitorSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  flatNumber: z.string().min(1),
  purpose: z.string().min(1),
  memberCount: z.number().int().min(1).optional().nullable(),
});

async function listAdminVisitors(req, res, next) {
  try {
    const { status, q } = req.query;
    const items = await prisma.visitor.findMany({
      where: {
        ...(status && status !== 'all' ? { status: String(status) } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: String(q), mode: 'insensitive' } },
                { purpose: { contains: String(q), mode: 'insensitive' } },
                { flat: { flatNumber: { contains: String(q), mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: { flat: { select: { flatNumber: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    res.json({
      success: true,
      data: items.map(v => ({
        id: v.id,
        name: v.name,
        phone: v.phone || '',
        flatNumber: v.flat?.flatNumber,
        purpose: v.purpose,
        memberCount: v.memberCount || 1,
        date: v.date,
        inTime: v.inTime,
        outTime: v.outTime,
        status: v.status,
        createdAt: v.createdAt,
      })),
    });
  } catch (err) { next(err); }
}

async function createVisitor(req, res, next) {
  try {
    const parsed = createVisitorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const { name, phone, flatNumber, purpose, memberCount } = parsed.data;
    const flat = await prisma.flat.findUnique({ where: { flatNumber } });
    if (!flat) return res.status(404).json({ success: false, error: 'Flat not found' });

    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const created = await prisma.visitor.create({
      data: {
        flatId: flat.id,
        name,
        phone: phone || null,
        purpose,
        memberCount: memberCount || null,
        date: dateOnly,
        inTime,
        outTime: null,
        status: 'in',
      },
      include: { flat: { select: { flatNumber: true } } },
    });

    // Notify resident(s) of this flat
    const residents = await prisma.resident.findMany({ where: { flatId: flat.id }, select: { userId: true } });
    if (residents.length) {
      await prisma.notification.createMany({
        data: residents.map(r => ({
          userId: r.userId,
          type: 'visitor',
          title: 'Visitor Logged',
          message: `${name} (${purpose}) entered for ${flat.flatNumber} at ${inTime}`,
        })),
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: created.id,
        name: created.name,
        phone: created.phone || '',
        flatNumber: created.flat.flatNumber,
        purpose: created.purpose,
        memberCount: created.memberCount || 1,
        date: created.date,
        inTime: created.inTime,
        outTime: created.outTime || '-',
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (err) { next(err); }
}

async function checkoutVisitor(req, res, next) {
  try {
    const { id } = req.params;
    const now = new Date();
    const outTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = await prisma.visitor.update({
      where: { id },
      data: { status: 'out', outTime },
      include: { flat: { select: { flatNumber: true } } },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        phone: updated.phone || '',
        flatNumber: updated.flat.flatNumber,
        purpose: updated.purpose,
        memberCount: updated.memberCount || 1,
        date: updated.date,
        inTime: updated.inTime,
        outTime: updated.outTime || '-',
        status: updated.status,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Visitor not found' });
    next(err);
  }
}

async function listResidentVisitors(req, res, next) {
  try {
    const resident = await prisma.resident.findUnique({ where: { userId: req.user.id }, include: { flat: true } });
    if (!resident) return res.status(404).json({ success: false, error: 'Resident profile not found' });

    const items = await prisma.visitor.findMany({
      where: { flatId: resident.flatId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      data: items.map(v => ({
        id: v.id,
        name: v.name,
        phone: v.phone || '',
        flatNumber: resident.flat.flatNumber,
        purpose: v.purpose,
        memberCount: v.memberCount || 1,
        date: v.date,
        inTime: v.inTime,
        outTime: v.outTime || '-',
        status: v.status,
        createdAt: v.createdAt,
      })),
    });
  } catch (err) { next(err); }
}

module.exports = { listAdminVisitors, createVisitor, checkoutVisitor, listResidentVisitors };
