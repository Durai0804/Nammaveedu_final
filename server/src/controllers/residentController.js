const prisma = require('../prisma/client');
const { z } = require('zod');
const { getResidentDashboard } = require('../services/residentService');
const bcrypt = require('bcrypt');

async function dashboard(req, res, next) {
  try {
    const payload = await getResidentDashboard(req.user.id);
    res.json({ success: true, data: payload });
  } catch (err) { next(err); }
}

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
});

async function updateProfile(req, res, next) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });
    }

    const { name, email, phone } = parsed.data;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
    });

    const updatedResident = await prisma.resident.update({
      where: { userId: req.user.id },
      data: {
        ...(phone ? { phone } : {}),
      },
      include: { flat: true },
    });

    return res.json({
      success: true,
      data: {
        user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, flatNumber: updatedUser.flatNumber },
        resident: { id: updatedResident.id, phone: updatedResident.phone, members: updatedResident.members },
        flat: updatedResident.flat,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Email already in use' });
    }
    next(err);
  }
}

module.exports = { dashboard, updateProfile };

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

async function changePassword(req, res, next) {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const ok = await bcrypt.compare(parsed.data.oldPassword, user.password);
    if (!ok) return res.status(401).json({ success: false, error: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    res.json({ success: true, data: { message: 'Password updated' } });
  } catch (err) { next(err); }
}

module.exports.changePassword = changePassword;
