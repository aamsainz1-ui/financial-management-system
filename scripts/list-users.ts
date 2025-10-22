import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        role: 'desc'
      }
    })

    console.log('=== รายชื่อผู้ใช้ทั้งหมดในระบบ ===')
    console.log('')
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`)
      console.log(`   Created: ${user.createdAt.toLocaleString('th-TH')}`)
      if (user.lastLoginAt) {
        console.log(`   Last Login: ${user.lastLoginAt.toLocaleString('th-TH')}`)
      }
      console.log('')
    })

    console.log('=== ข้อมูลการเข้าสู่ระบบ ===')
    console.log('สำหรับ Owner:')
    console.log('  Username: owner')
    console.log('  PIN: 123456')
    console.log('')
    console.log('สำหรับ Admin:')
    console.log('  Username: admin')
    console.log('  PIN: 123456')
    console.log('')
    console.log('สำหรับ Editor:')
    console.log('  Username: editor')
    console.log('  PIN: 123456')
    console.log('')
    console.log('สำหรับ Viewer:')
    console.log('  Username: viewer')
    console.log('  PIN: 123456')

  } catch (error) {
    console.error('Error listing users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()