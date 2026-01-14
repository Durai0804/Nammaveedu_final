const prisma = require('../prisma/client');
const { z } = require('zod');
const bcrypt = require('bcrypt');

function normalizePhone(input) {
  if (!input) return null;
  const digits = String(input).replace(/\D/g, '');
  // Keep last 10 digits (common for Indian mobiles)
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

const createResidentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().min(6),
  flatNumber: z.string().min(1),
  block: z.string().min(1),
  floor: z.string().min(1),
  members: z.number().int().min(1).optional().nullable(),
  ownerName: z.string().optional().nullable(),
});

async function createResident(req, res, next) {
  try {
    const parsed = createResidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input', details: parsed.error.flatten() });

    const { name, email, mobile, flatNumber, block, floor, members, ownerName } = parsed.data;
    const normalizedMobile = normalizePhone(mobile);

    // Deduplicate by email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ success: false, error: 'Email already exists' });

    // Deduplicate by phone in residents (store normalized)
    const existingPhone = await prisma.resident.findFirst({ where: { phone: normalizedMobile } });
    if (existingPhone) return res.status(409).json({ success: false, error: 'Mobile already exists' });

    // Ensure flat exists (or create)
    let flat = await prisma.flat.findUnique({ where: { flatNumber } });
    if (!flat) {
      flat = await prisma.flat.create({
        data: {
          flatNumber,
          block,
          floor,
          ownerName: ownerName || null,
        },
      });
    }

    // Enforce one active resident per flat (simple check: any resident linked)
    const existResidentForFlat = await prisma.resident.findFirst({ where: { flatId: flat.id } });
    if (existResidentForFlat) {
      return res.status(409).json({ success: false, error: 'A resident already exists for this flat' });
    }

    // Create user with RESIDENT role
    const hashed = await bcrypt.hash('Temp@1234', 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: 'RESIDENT',
        flatNumber,
      },
    });

    // Create resident profile linked to user + flat
    const resident = await prisma.resident.create({
      data: {
        userId: user.id,
        flatId: flat.id,
        phone: normalizedMobile,
        members: members || null,
      },
      include: { flat: true, user: true },
    });

    res.status(201).json({ success: true, data: {
      id: resident.id,
      name: user.name,
      email: user.email,
      mobile: resident.phone,
      flatNumber: flat.flatNumber,
      block: flat.block,
      floor: flat.floor,
      members: resident.members || 0,
      createdAt: resident.createdAt,
    }});
  } catch (err) { next(err); }
}

async function resetAllResidentPasswords(req, res, next) {
  try {
    const hashed = await bcrypt.hash('Temp@1234', 10);
    const result = await prisma.user.updateMany({
      where: { role: 'RESIDENT' },
      data: { password: hashed },
    });
    res.json({ success: true, data: { updatedCount: result.count } });
  } catch (err) { next(err); }
}

module.exports = { createResident, resetAllResidentPasswords };
