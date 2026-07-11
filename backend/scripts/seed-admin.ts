/**
 * Script to create the first admin user
 * Usage: npx ts-node scripts/seed-admin.ts
 */

import bcrypt from 'bcrypt'
import prisma from '../src/config/database'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function createAdmin() {
  try {
    console.log('=== SharedReads Admin Creation ===\n')

    const email = await question('Admin Email: ')
    const name = await question('Admin Name: ')
    const password = await question('Password (min 8 characters): ')
    const confirmPassword = await question('Confirm Password: ')

    // Validation
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      process.exit(1)
    }

    if (!name || name.trim().length < 2) {
      console.error('❌ Name must be at least 2 characters')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters')
      process.exit(1)
    }

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match')
      process.exit(1)
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    })

    if (existingAdmin) {
      console.error('❌ Admin with this email already exists')
      process.exit(1)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        name: name.trim(),
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    })

    console.log('\n✅ Admin created successfully!')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log('\nYou can now login at /admin/login')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createAdmin()
