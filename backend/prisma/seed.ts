import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
