import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPasswords() {
  try {
    const users = [
      { username: 'admin', password: '123456' },
      { username: 'editor', password: '123456' },
      { username: 'viewer', password: '123456' },
      { username: 'owner', password: '123456' },
      { username: 'testpin', password: '123456' }
    ]

    for (const { username, password } of users) {
      const user = await prisma.user.findUnique({
        where: { username }
      })

      if (user) {
        const hashedPassword = await bcrypt.hash(password, 12)
        
        await prisma.user.update({
          where: { username },
          data: { password: hashedPassword }
        })
        
        console.log(`✅ Reset password for: ${username}`)
      } else {
        console.log(`❌ User not found: ${username}`)
      }
    }

    console.log('\n🎉 รีเซ็ตรหัสผ่านเสร็จสมบูรณ์!')
    console.log('ทุกผู้ใช้สามารถเข้าสู่ระบบด้วย PIN: 123456')

  } catch (error) {
    console.error('❌ Error resetting passwords:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPasswords()