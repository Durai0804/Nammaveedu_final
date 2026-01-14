const prisma = require('../prisma/client');
const { z } = require('zod');
const bcrypt = require('bcrypt');

async function dashboard(req, res, next) {
  try {
    const [totalFlats, pendingComplaints, allMaint] = await Promise.all([
      prisma.flat.count(),
      prisma.complaint.count({ where: { status: { not: 'RESOLVED' } } }),
      prisma.maintenance.findMany({})
    ]);

    const maintenanceCollected = allMaint
      .filter(m => m.status.toLowerCase() === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    const totalMaintenance = allMaint.reduce((sum, m) => sum + (m.amount || 0), 0);
    const collectionPercentage = totalMaintenance ? Math.round((maintenanceCollected / totalMaintenance) * 100) : 0;

    // Build recent activity feed from multiple sources
    const [notices, complaints, visitors] = await Promise.all([
      prisma.notice.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.complaint.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.visitor.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    const recentActivities = [
      ...notices.map(n => ({ type: 'notice', text: `Notice posted - ${n.title}`, time: n.createdAt })),
      ...complaints.map(c => ({ type: 'complaint', text: `New complaint - ${c.description.slice(0, 40)}${c.description.length > 40 ? '…' : ''}`, time: c.createdAt })),
      ...visitors.map(v => ({ type: 'visitor', text: `Visitor logged - ${v.name}`, time: v.createdAt })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8)
      .map(a => ({ text: a.text, time: a.time }));

    res.json({
      success: true,
      data: {
        stats: {
          totalFlats,
          pendingComplaints,
          maintenanceCollected,
          totalMaintenance,
          collectionPercentage,
        },
        recentActivities,
      }
    });
  } catch (err) { next(err); }
}

async function listFlats(req, res, next) {
  try {
    const flats = await prisma.flat.findMany({ orderBy: { flatNumber: 'asc' } });
    const flatIds = flats.map(f => f.id);

    const [maintenance, complaints, residents] = await Promise.all([
      prisma.maintenance.findMany({
        where: { flatId: { in: flatIds } },
        orderBy: [{ createdAt: 'desc' }],
      }),
      prisma.complaint.findMany({
        where: { OR: [{ flatId: { in: flatIds } }, { flatNumber: { in: flats.map(f => f.flatNumber) } }] },
        select: { id: true, flatId: true, flatNumber: true, status: true },
      })
      ,
      prisma.resident.findMany({
        where: { flatId: { in: flatIds } },
        select: { flatId: true, phone: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const latestMaintByFlat = new Map();
    for (const m of maintenance) {
      if (!latestMaintByFlat.has(m.flatId)) latestMaintByFlat.set(m.flatId, m);
    }

    const openComplaintCountByFlatNumber = new Map();
    for (const c of complaints) {
      const isOpen = String(c.status).toUpperCase() !== 'RESOLVED' && String(c.status).toLowerCase() !== 'resolved';
      if (!isOpen) continue;
      const key = c.flatNumber || null;
      if (!key) continue;
      openComplaintCountByFlatNumber.set(key, (openComplaintCountByFlatNumber.get(key) || 0) + 1);
    }

    const phoneByFlat = new Map();
    for (const r of residents) {
      if (!phoneByFlat.has(r.flatId)) phoneByFlat.set(r.flatId, r.phone || '');
    }

    const payload = flats.map(f => {
      const latest = latestMaintByFlat.get(f.id);
      const maintStatus = latest?.status ? String(latest.status).toLowerCase() : 'unpaid';
      const maintAmount = Number(latest?.amount || 0);
      return {
        id: f.id,
        flatNumber: f.flatNumber,
        owner: f.ownerName,
        mobile: phoneByFlat.get(f.id) || '',
        maintenance: maintAmount,
        status: maintStatus === 'paid' ? 'paid' : 'unpaid',
        activeComplaints: openComplaintCountByFlatNumber.get(f.flatNumber) || 0,
      };
    });

    res.json({ success: true, data: payload });
  } catch (err) { next(err); }
}

const upsertFlatSchema = z.object({
  flatNumber: z.string().min(2),
  owner: z.string().min(2),
  mobile: z.string().min(8),
  maintenance: z.number().int().nonnegative(),
  status: z.enum(['paid', 'unpaid']),
});

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${(s[(v - 20) % 10] || s[v] || s[0])}`;
};

const inferBlockFloor = (flatNumber) => {
  const [blockRaw, numRaw] = String(flatNumber).split('-');
  const block = (blockRaw || 'A').trim().toUpperCase();
  const num = parseInt(numRaw, 10);
  const floorNum = Number.isFinite(num) ? Math.max(1, Math.floor(num / 100)) : 1;
  return { block, floor: `${ordinal(floorNum)} Floor` };
};

async function createFlat(req, res, next) {
  try {
    const parsed = upsertFlatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const { flatNumber, owner, mobile, maintenance, status } = parsed.data;
    const { block, floor } = inferBlockFloor(flatNumber);

    const phoneDigits = mobile.replace(/\D/g, '');
    const email = `resident_${phoneDigits}@nammaveedu.local`;
    const password = await bcrypt.hash('resident@123', 10);

    const result = await prisma.$transaction(async (tx) => {
      const flat = await tx.flat.create({
        data: {
          flatNumber,
          block,
          floor,
          ownerName: owner,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          password,
          name: owner,
          role: 'RESIDENT',
          flatNumber,
        },
      });

      await tx.resident.create({
        data: {
          userId: user.id,
          flatId: flat.id,
          phone: mobile,
        },
      });

      const month = new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      await tx.maintenance.create({
        data: {
          flatId: flat.id,
          month,
          amount: maintenance,
          status: status === 'paid' ? 'paid' : 'pending',
          paidAt: status === 'paid' ? new Date() : null,
        },
      });

      return { flat, user };
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.flat.id,
        flatNumber: result.flat.flatNumber,
        owner: result.flat.ownerName,
        mobile,
        maintenance,
        status,
        activeComplaints: 0,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'Flat number or email already exists' });
    next(err);
  }
}

async function updateFlat(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = upsertFlatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const { flatNumber, owner, mobile, maintenance, status } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const flat = await tx.flat.update({
        where: { id },
        data: { ownerName: owner },
      });

      const resi = await tx.resident.findFirst({ where: { flatId: id }, orderBy: { createdAt: 'desc' } });
      if (resi) {
        await tx.resident.update({ where: { id: resi.id }, data: { phone: mobile } });
        await tx.user.update({ where: { id: resi.userId }, data: { name: owner, flatNumber: flatNumber } });
      }

      const month = new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      await tx.maintenance.create({
        data: {
          flatId: flat.id,
          month,
          amount: maintenance,
          status: status === 'paid' ? 'paid' : 'pending',
          paidAt: status === 'paid' ? new Date() : null,
        },
      });

      return flat;
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        flatNumber,
        owner,
        mobile,
        maintenance,
        status,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Flat not found' });
    next(err);
  }
}

async function deleteFlat(req, res, next) {
  try {
    const { id } = req.params;
    const flat = await prisma.flat.findUnique({ where: { id } });
    if (!flat) return res.status(404).json({ success: false, error: 'Flat not found' });

    await prisma.$transaction(async (tx) => {
      const complaints = await tx.complaint.findMany({
        where: { OR: [{ flatId: id }, { flatNumber: flat.flatNumber }] },
        select: { id: true },
      });
      const complaintIds = complaints.map(c => c.id);
      if (complaintIds.length) {
        await tx.comment.deleteMany({ where: { complaintId: { in: complaintIds } } });
        await tx.complaint.deleteMany({ where: { id: { in: complaintIds } } });
      }

      await tx.visitor.deleteMany({ where: { flatId: id } });
      await tx.maintenance.deleteMany({ where: { flatId: id } });

      const residents = await tx.resident.findMany({ where: { flatId: id }, select: { id: true, userId: true } });
      const userIds = residents.map(r => r.userId);
      if (userIds.length) {
        await tx.preApproval.deleteMany({ where: { createdById: { in: userIds } } });
        await tx.resident.deleteMany({ where: { flatId: id } });
        await tx.user.deleteMany({ where: { id: { in: userIds } } });
      }

      await tx.flat.delete({ where: { id } });
    });

    res.json({ success: true, data: { id } });
  } catch (err) { next(err); }
}

async function listFlatOpenComplaints(req, res, next) {
  try {
    const { id } = req.params;
    const flat = await prisma.flat.findUnique({ where: { id } });
    if (!flat) return res.status(404).json({ success: false, error: 'Flat not found' });

    const complaints = await prisma.complaint.findMany({
      where: {
        OR: [{ flatId: id }, { flatNumber: flat.flatNumber }],
        status: { not: 'RESOLVED' },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      success: true,
      data: {
        flat: { id: flat.id, flatNumber: flat.flatNumber, ownerName: flat.ownerName },
        complaints,
      },
    });
  } catch (err) { next(err); }
}

async function listMaintenance(req, res, next) {
  try {
    const { status, q, month } = req.query;

    const items = await prisma.maintenance.findMany({
      where: {
        ...(month && month !== 'all'
          ? {
              month: String(month),
            }
          : {}),
        ...(status && status !== 'all'
          ? {
              status: status === 'paid' ? 'paid' : 'pending',
            }
          : {}),
        ...(q
          ? {
              OR: [
                { month: { contains: String(q), mode: 'insensitive' } },
                { flat: { flatNumber: { contains: String(q), mode: 'insensitive' } } },
                { flat: { ownerName: { contains: String(q), mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        flat: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const flatIds = Array.from(new Set(items.map(m => m.flatId)));
    const residents = await prisma.resident.findMany({
      where: { flatId: { in: flatIds } },
      select: { flatId: true, phone: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    const phoneByFlat = new Map();
    for (const r of residents) {
      if (!phoneByFlat.has(r.flatId)) phoneByFlat.set(r.flatId, r.phone || '');
    }

    const payload = items.map(m => ({
      id: m.id,
      flatId: m.flatId,
      flatNumber: m.flat?.flatNumber,
      owner: m.flat?.ownerName || '',
      mobile: phoneByFlat.get(m.flatId) || '',
      month: m.month,
      maintenance: m.amount,
      status: String(m.status).toLowerCase() === 'paid' ? 'paid' : 'unpaid',
      paidAt: m.paidAt,
      createdAt: m.createdAt,
    }));

    res.json({ success: true, data: payload });
  } catch (err) { next(err); }
}

const updateMaintenanceSchema = z.object({
  maintenance: z.number().int().nonnegative(),
  status: z.enum(['paid', 'unpaid']),
});

async function updateMaintenance(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = updateMaintenanceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        amount: parsed.data.maintenance,
        status: parsed.data.status === 'paid' ? 'paid' : 'pending',
        paidAt: parsed.data.status === 'paid' ? new Date() : null,
      },
      include: { flat: true },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        flatId: updated.flatId,
        flatNumber: updated.flat?.flatNumber,
        owner: updated.flat?.ownerName || '',
        month: updated.month,
        maintenance: updated.amount,
        status: String(updated.status).toLowerCase() === 'paid' ? 'paid' : 'unpaid',
        paidAt: updated.paidAt,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Maintenance record not found' });
    next(err);
  }
}

module.exports = { dashboard, listFlats, createFlat, updateFlat, deleteFlat, listFlatOpenComplaints, listMaintenance, updateMaintenance };
