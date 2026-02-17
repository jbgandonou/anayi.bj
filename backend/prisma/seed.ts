import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('changez-moi-immediatement', 12);

  await prisma.user.upsert({
    where: { email: 'admin@anayi.bj' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Anayi',
      email: 'admin@anayi.bj',
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log('Seed terminé : admin@anayi.bj créé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
