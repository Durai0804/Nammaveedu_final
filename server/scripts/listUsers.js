const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  try {
    const users = await prisma.user.findMany({
      include: {
        resident: { select: { phone: true } },
      },
    });

    console.log('=== Users in Database ===');
    for (const u of users) {
      console.log(`Role: ${u.role}`);
      console.log(`Email: ${u.email}`);
      console.log(`Mobile (resident only): ${u.resident?.phone || 'N/A'}`);
      console.log(`Password (hash): ${u.password}`);
      console.log(`FlatNumber: ${u.flatNumber || 'N/A'}`);
      console.log('---');
    }
  } catch (err) {
    console.error('Failed to fetch users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
