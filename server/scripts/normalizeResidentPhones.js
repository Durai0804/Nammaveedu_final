const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizePhone(input) {
  if (!input) return null;
  const digits = String(input).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

async function main() {
  const residents = await prisma.resident.findMany({ select: { id: true, phone: true } });
  let updated = 0;
  for (const r of residents) {
    const normalized = normalizePhone(r.phone);
    if (normalized && normalized !== r.phone) {
      await prisma.resident.update({ where: { id: r.id }, data: { phone: normalized } });
      updated++;
    }
  }
  console.log(`Normalized ${updated} resident phone numbers to 10-digit format.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
