import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function testLogin() {
  try {
    console.log('=== 测试登录功能 ===')
    
    // 测试每个用户
    const testUsers = [
      { username: 'owner', password: '123456' },
      { username: 'admin', password: '123456' },
      { username: 'editor', password: '123456' },
      { username: 'viewer', password: '123456' }
    ]
    
    for (const testUser of testUsers) {
      console.log(`\n测试用户: ${testUser.username}`)
      
      // 查找用户
      const user = await db.user.findUnique({
        where: { username: testUser.username }
      })
      
      if (!user) {
        console.log(`❌ 用户 ${testUser.username} 不存在`)
        continue
      }
      
      console.log(`✅ 找到用户: ${user.username}`)
      console.log(`   邮箱: ${user.email}`)
      console.log(`   角色: ${user.role}`)
      console.log(`   激活状态: ${user.isActive}`)
      
      // 验证密码
      const isValid = await bcrypt.compare(testUser.password, user.password)
      console.log(`   密码验证: ${isValid ? '✅ 通过' : '❌ 失败'}`)
      
      if (!isValid) {
        console.log(`   存储的密码哈希: ${user.password.substring(0, 20)}...`)
      }
    }
    
  } catch (error) {
    console.error('测试登录时出错:', error)
  } finally {
    await db.$disconnect()
  }
}

// 运行测试
testLogin()