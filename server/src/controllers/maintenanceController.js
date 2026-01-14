const prisma = require('../prisma/client');

async function history(req, res, next) {
  try {
    // If admin, can query by flatNumber param; if resident, infer from user
    const { flatNumber, limit } = req.query;
    let targetFlat;

    if (flatNumber) {
      targetFlat = await prisma.flat.findUnique({ where: { flatNumber } });
    } else {
      const resident = await prisma.resident.findUnique({ where: { userId: req.user.id }, include: { flat: true } });
      targetFlat = resident?.flat || null;
    }

    if (!targetFlat) return res.status(404).json({ success: false, error: 'Flat not found' });

    const take = Math.min(parseInt(limit || '12', 10), 24);
    const items = await prisma.maintenance.findMany({
      where: { flatId: targetFlat.id },
      orderBy: { createdAt: 'desc' },
      take,
    });

    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

module.exports = { history };
