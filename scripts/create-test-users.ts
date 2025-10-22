import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@system.local',
        name: 'System Administrator',
        role: 'ADMIN',
        password: '123456'
      },
      {
        username: 'editor',
        email: 'editor@system.local',
        name: 'Editor User',
        role: 'EDITOR',
        password: '123456'
      },
      {
        username: 'viewer',
        email: 'viewer@system.local',
        name: 'Viewer User',
        role: 'VIEWER',
        password: '123456'
      }
    ]

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      })

      if (existingUser) {
        console.log(`✅ User ${userData.username} already exists`)
        continue
      }

      // Create user
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          isActive: true,
        },
      })

      console.log(`✅ Created user: ${user.username} (${user.role})`)
    }

    console.log('\n🎉 สร้างผู้ใช้ทดสอบเสร็จสมบูรณ์!')
    console.log('\n📋 รายชื่อผู้ใช้ทั้งหมด:')
    console.log('Username: admin, PIN: 123456, Role: ADMIN')
    console.log('Username: editor, PIN: 123456, Role: EDITOR')
    console.log('Username: viewer, PIN: 123456, Role: VIEWER')
    console.log('Username: owner, PIN: 123456, Role: OWNER')

  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()