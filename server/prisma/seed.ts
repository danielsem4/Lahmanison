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
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  password: string;
}

const users: SeedUser[] = [
  {
    email: 'admin@lahmanison.local',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+972500000000',
    role: Role.ADMIN,
    password: 'Admin123!',
  },
  {
    email: 'manager@lahmanison.local',
    firstName: 'Manager',
    lastName: 'User',
    phone: '+972500000001',
    role: Role.MANAGER,
    password: 'Manager123!',
  },
];

async function main() {
  console.log('Seeding database...');

  for (const u of users) {
    const hashPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
    const name = `${u.firstName} ${u.lastName}`;
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        hashPassword,
        isActive: true,
      },
      create: {
        email: u.email,
        name,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        hashPassword,
      },
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
