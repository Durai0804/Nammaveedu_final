const prisma = require('../prisma/client');
const { z } = require('zod');

const createSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().min(1),
  expectedTime: z.string().optional().nullable(),
});

async function listMyPreApprovals(req, res, next) {
  try {
    const items = await prisma.preApproval.findMany({
      where: { createdById: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

async function createPreApproval(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!user.flatNumber) return res.status(400).json({ success: false, error: 'User has no flat assigned' });

    const created = await prisma.preApproval.create({
      data: {
        createdById: user.id,
        flatNumber: user.flatNumber,
        name: parsed.data.name,
        purpose: parsed.data.purpose,
        expectedTime: parsed.data.expectedTime || null,
      },
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
}

async function deleteMyPreApproval(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.preApproval.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Pre-approval not found' });
    if (existing.createdById !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await prisma.preApproval.delete({ where: { id } });
    res.json({ success: true, data: { id } });
  } catch (err) { next(err); }
}

async function listAllPreApprovals(req, res, next) {
  try {
    const items = await prisma.preApproval.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { createdBy: { select: { id: true, name: true, email: true, flatNumber: true } } },
    });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

module.exports = { listMyPreApprovals, createPreApproval, deleteMyPreApproval, listAllPreApprovals };
/**
 * Admin check-in a pre-approved visitor: creates a Visitor entry and removes the PreApproval.
 */
async function checkinPreApproval(req, res, next) {
  try {
    const { id } = req.params;
    const pa = await prisma.preApproval.findUnique({ where: { id } });
    if (!pa) return res.status(404).json({ success: false, error: 'Pre-approval not found' });

    // find flat by flatNumber
    const flat = await prisma.flat.findUnique({ where: { flatNumber: pa.flatNumber } });
    if (!flat) return res.status(400).json({ success: false, error: 'Flat not found for pre-approval' });

    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const created = await prisma.visitor.create({
      data: {
        flatId: flat.id,
        name: pa.name,
        phone: null,
        purpose: pa.purpose,
        memberCount: null,
        date: dateOnly,
        inTime,
        outTime: null,
        status: 'in',
      },
      include: { flat: { select: { flatNumber: true } } },
    });

    // remove the pre-approval after check-in
    await prisma.preApproval.delete({ where: { id } });

    // Notify resident(s) of this flat similar to createVisitor
    const residents = await prisma.resident.findMany({ where: { flatId: flat.id }, select: { userId: true } });
    if (residents.length) {
      await prisma.notification.createMany({
        data: residents.map(r => ({
          userId: r.userId,
          type: 'visitor',
          title: 'Pre-approved Visitor Checked In',
          message: `${pa.name} (${pa.purpose}) entered for ${flat.flatNumber} at ${inTime}`,
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

module.exports.checkinPreApproval = checkinPreApproval;
