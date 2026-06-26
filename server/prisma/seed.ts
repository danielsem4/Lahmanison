import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
  connectionString: process.env['DATABASE_URL'],
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

interface SeedUser {
  email: string;
  name: string;
  role: Role;
  password: string;
}

const users: SeedUser[] = [
  {
    email: 'admin@lahmanison.local',
    name: 'Admin User',
    role: Role.ADMIN,
    password: 'Admin123!',
  },
  {
    email: 'user@lahmanison.local',
    name: 'Regular User',
    role: Role.USER,
    password: 'User123!',
  },
];

async function main() {
  console.log('Seeding database...');

  for (const u of users) {
    const hashPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, hashPassword, isActive: true },
      create: { email: u.email, name: u.name, role: u.role, hashPassword },
    });
  }
  console.log(`Seeded ${users.length} users.`);

  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: 'admin@lahmanison.local' },
  });

  // Reset example items so re-seeding stays idempotent
  await prisma.item.deleteMany({ where: { ownerId: admin.id } });
  await prisma.item.createMany({
    data: [
      { title: 'First item', description: 'An example item to get you started.', ownerId: admin.id },
      { title: 'Second item', description: 'Edit or delete me from the UI.', ownerId: admin.id },
    ],
  });
  console.log('Seeded 2 example items.');
}

main()
  .then(() => {
    console.log('Seeding complete.');
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void pool.end();
  });
