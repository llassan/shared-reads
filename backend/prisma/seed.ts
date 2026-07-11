import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('AdminPassword123', 12);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@sharedreads.app' },
    update: {},
    create: {
      email: 'admin@sharedreads.app',
      passwordHash: adminPasswordHash,
      name: 'Platform Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Admin user created:');
  console.log('   Email: admin@sharedreads.app');
  console.log('   Password: AdminPassword123');
  console.log('   ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN');

  console.log('\n🌱 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
