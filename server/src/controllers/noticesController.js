const prisma = require('../prisma/client');
const { z } = require('zod');

async function listNotices(req, res, next) {
  try {
    const { status } = req.query; // UPCOMING | ONGOING | COMPLETED
    const where = status ? { status } : {};
    const notices = await prisma.notice.findMany({ where, orderBy: { date: 'desc' } });
    res.json({ success: true, data: notices });
  } catch (err) { next(err); }
}

const upsertNoticeSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED']),
  date: z.union([z.string().min(4), z.date()]),
  time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

async function createNotice(req, res, next) {
  try {
    const parsed = upsertNoticeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const payload = parsed.data;
    const date = payload.date instanceof Date ? payload.date : new Date(payload.date);

    const created = await prisma.notice.create({
      data: {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        date,
        time: payload.time || null,
        location: payload.location || null,
      },
    });

    // Notify all residents
    const residents = await prisma.user.findMany({ where: { role: 'RESIDENT' }, select: { id: true } });
    if (residents.length) {
      await prisma.notification.createMany({
        data: residents.map(u => ({
          userId: u.id,
          type: 'notice',
          title: 'New Notice',
          message: `${created.title}`,
        })),
      });
    }

    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
}

async function updateNotice(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = upsertNoticeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const payload = parsed.data;
    const date = payload.date instanceof Date ? payload.date : new Date(payload.date);

    const updated = await prisma.notice.update({
      where: { id },
      data: {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        date,
        time: payload.time || null,
        location: payload.location || null,
      },
    });

    // Notify all residents about update
    const residents = await prisma.user.findMany({ where: { role: 'RESIDENT' }, select: { id: true } });
    if (residents.length) {
      await prisma.notification.createMany({
        data: residents.map(u => ({
          userId: u.id,
          type: 'notice',
          title: 'Notice Updated',
          message: `${updated.title}`,
        })),
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Notice not found' });
    next(err);
  }
}

async function deleteNotice(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.notice.delete({ where: { id } });
    res.json({ success: true, data: { id } });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Notice not found' });
    next(err);
  }
}

module.exports = { listNotices, createNotice, updateNotice, deleteNotice };
