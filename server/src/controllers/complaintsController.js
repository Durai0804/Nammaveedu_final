const prisma = require('../prisma/client');
const { z } = require('zod');

const createComplaintSchema = z.object({
  flatNumber: z.string().min(1),
  description: z.string().min(5),
});

const updateComplaintSchema = z.object({
  description: z.string().min(5).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).optional(),
  assignedTo: z.string().min(1).optional().nullable(),
});

const addCommentSchema = z.object({
  text: z.string().min(1),
});

async function getComplaintById(req, res, next) {
  try {
    const { id } = req.params;
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true, email: true, role: true } } },
        },
      },
    });
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const role = req.user?.role;
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
    const isOwner = complaint.createdById === req.user?.id;
    if (!isAdmin && !isOwner) return res.status(403).json({ success: false, error: 'Forbidden' });

    res.json({ success: true, data: complaint });
  } catch (err) { next(err); }
}

async function listResidentComplaints(req, res, next) {
  try {
    const resident = await prisma.resident.findUnique({
      where: { userId: req.user.id },
      include: { flat: true },
    });
    if (!resident) return res.status(404).json({ success: false, error: 'Resident profile not found' });

    const items = await prisma.complaint.findMany({
      where: {
        OR: [
          { createdById: req.user.id },
          { flatId: resident.flatId },
          { flatNumber: resident.flat.flatNumber },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

async function listAllComplaints(req, res, next) {
  try {
    const items = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

async function updateComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = updateComplaintSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const before = await prisma.complaint.findUnique({ where: { id } });
    if (!before) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        ...(typeof parsed.data.description === 'string' ? { description: parsed.data.description } : {}),
        ...(typeof parsed.data.status === 'string' ? { status: parsed.data.status } : {}),
        ...(parsed.data.assignedTo !== undefined ? { assignedTo: parsed.data.assignedTo || null } : {}),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify resident when admin updates complaint
    if (req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN') {
      const changes = [];
      if (typeof parsed.data.status === 'string' && parsed.data.status !== before.status) {
        changes.push(`Status: ${before.status} → ${parsed.data.status}`);
      }
      if (parsed.data.assignedTo !== undefined && (parsed.data.assignedTo || null) !== (before.assignedTo || null)) {
        changes.push(`Assigned To: ${before.assignedTo || 'Unassigned'} → ${parsed.data.assignedTo || 'Unassigned'}`);
      }
      if (typeof parsed.data.description === 'string' && parsed.data.description !== before.description) {
        changes.push('Description updated');
      }

      if (changes.length) {
        await prisma.notification.create({
          data: {
            userId: before.createdById,
            complaintId: before.id,
            type: 'complaint_update',
            title: 'Complaint Updated',
            message: `Your complaint has been updated. ${changes.join(' • ')}`,
          },
        });
      }
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Complaint not found' });
    next(err);
  }
}

async function listComplaintComments(req, res, next) {
  try {
    const { id } = req.params;
    const exists = await prisma.complaint.findUnique({ where: { id }, select: { id: true, createdById: true } });
    if (!exists) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const comments = await prisma.comment.findMany({
      where: { complaintId: id },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, email: true, role: true } } },
    });
    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
}

async function addComplaintComment(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = addCommentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const exists = await prisma.complaint.findUnique({ where: { id }, select: { id: true, createdById: true } });
    if (!exists) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const created = await prisma.comment.create({
      data: {
        complaintId: id,
        authorId: req.user.id,
        text: parsed.data.text,
      },
      include: { author: { select: { id: true, name: true, email: true, role: true } } },
    });

    // Notify resident when admin adds a comment
    if (req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN') {
      await prisma.notification.create({
        data: {
          userId: exists.createdById,
          complaintId: id,
          type: 'complaint_comment',
          title: 'New Comment on Complaint',
          message: `Admin commented: ${parsed.data.text.slice(0, 140)}${parsed.data.text.length > 140 ? '…' : ''}`,
        },
      });
    }
    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
}

async function deleteComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const role = req.user.role;
    const canDelete = complaint.createdById === req.user.id || role === 'ADMIN' || role === 'SUPER_ADMIN';
    if (!canDelete) return res.status(403).json({ success: false, error: 'Forbidden' });

    await prisma.comment.deleteMany({ where: { complaintId: id } });
    await prisma.complaint.delete({ where: { id } });

    res.json({ success: true, data: { id } });
  } catch (err) { next(err); }
}

async function createComplaint(req, res, next) {
  try {
    const parsed = createComplaintSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });
    const { flatNumber, description } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const flat = await prisma.flat.findUnique({ where: { flatNumber } });

    const created = await prisma.complaint.create({
      data: {
        flatNumber,
        flatId: flat ? flat.id : null,
        description,
        createdById: user.id,
      },
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
}

module.exports = {
  getComplaintById,
  createComplaint,
  listResidentComplaints,
  deleteComplaint,
  listAllComplaints,
  updateComplaint,
  listComplaintComments,
  addComplaintComment,
};
