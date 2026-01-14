const { PrismaClient } = require('@prisma/client');

// Singleton Prisma client to avoid exhausting connections in dev
let prisma;

if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}
prisma = global.__prisma;

module.exports = prisma;
