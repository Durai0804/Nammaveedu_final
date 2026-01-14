const prisma = require('../prisma/client');

async function listMyNotifications(req, res, next) {
  try {
    const take = Math.min(parseInt(req.query.take || '20', 10) || 20, 100);
    const items = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take,
    });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

async function markNotificationsRead(req, res, next) {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (!ids.length) {
      await prisma.notification.updateMany({ where: { userId: req.user.id, read: false }, data: { read: true } });
      return res.json({ success: true, data: { updated: 'all' } });
    }

    await prisma.notification.updateMany({
      where: { userId: req.user.id, id: { in: ids } },
      data: { read: true },
    });

    res.json({ success: true, data: { updated: ids.length } });
  } catch (err) { next(err); }
}

module.exports = { listMyNotifications, markNotificationsRead };
