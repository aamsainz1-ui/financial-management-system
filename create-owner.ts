import { PrismaClient } from '@prisma/client'
import { hashPassword } from './src/lib/auth-server'

const prisma = new PrismaClient()

async function createOwner() {
  try {
    // Check if owner user already exists
    const existingOwner = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    })

    if (existingOwner) {
      console.log('Owner user already exists:', existingOwner.email)
      return
    }

    // Create owner user
    const hashedPassword = await hashPassword('owner123')
    const owner = await prisma.user.create({
      data: {
        email: 'owner@website.com',
        username: 'owner',
        password: hashedPassword,
        name: 'เจ้าของเว็บไซต์',
        role: 'OWNER',
        isActive: true,
      },
    })

    console.log('👑 Owner user created successfully:')
    console.log('📧 Email: owner@website.com')
    console.log('🔑 Password: owner123')
    console.log('👤 Username: owner')
    console.log('🎭 Role: OWNER (สิทธิ์สูงสุด)')
    console.log('')
    console.log('✅ Owner มีสิทธิ์ควบคุมทุกอย่างในระบบ!')
    console.log('🔐 สามารถจัดการผู้ใช้ทุกระดับ รวมถึง Admin')

  } catch (error) {
    console.error('Error creating owner user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createOwner()