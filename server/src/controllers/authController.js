const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

function normalizePhone(input) {
  if (!input) return null;
  const digits = String(input).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

const signToken = (user) => (
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' })
);

async function login(req, res, next) {
  try {
    const { email, mobile, password } = req.body;
    if ((!email && !mobile) || !password) {
      return res.status(400).json({ success: false, error: 'Email or mobile and password required' });
    }

    let user = null;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (mobile) {
      const normalized = normalizePhone(mobile);
      if (normalized) {
        const resident = await prisma.resident.findFirst({ where: { phone: normalized }, include: { user: true } });
        user = resident?.user || null;
      }
    }

    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, flatNumber: user.flatNumber } } });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role, flatNumber: user.flatNumber } });
  } catch (err) { next(err); }
}

module.exports = { login, me };
