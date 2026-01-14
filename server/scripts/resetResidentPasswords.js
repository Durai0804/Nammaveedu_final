const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetPasswords() {
  const defaultPassword = 'Temp@1234';
  const hash = await bcrypt.hash(defaultPassword, 10);
  
  const result = await prisma.user.updateMany({
    where: { role: 'RESIDENT' },
    data: { password: hash }
  });
  
  console.log(`Updated ${result.count} resident passwords to '${defaultPassword}'`);
  await prisma.$disconnect();
}

resetPasswords().catch(console.error);
