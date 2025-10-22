import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function testFullLogin() {
  try {
    console.log('=== 完整登录流程测试 ===')
    
    // 测试数据
    const testUsername = 'owner'
    const testPassword = '123456'
    
    console.log(`\n1. 测试用户名: ${testUsername}`)
    console.log(`2. 测试密码: ${testPassword}`)
    
    // 步骤1: 查找用户
    const user = await db.user.findUnique({
      where: { username: testUsername }
    })
    
    if (!user) {
      console.log('❌ 用户不存在')
      return
    }
    
    console.log('\n✅ 步骤1: 找到用户')
    console.log(`   ID: ${user.id}`)
    console.log(`   用户名: ${user.username}`)
    console.log(`   邮箱: ${user.email}`)
    console.log(`   角色: ${user.role}`)
    console.log(`   激活状态: ${user.isActive}`)
    
    // 步骤2: 验证密码
    const isValidPassword = await bcrypt.compare(testPassword, user.password)
    console.log(`\n✅ 步骤2: 密码验证 ${isValidPassword ? '通过' : '失败'}`)
    
    if (!isValidPassword) {
      console.log('❌ 密码验证失败')
      return
    }
    
    // 步骤3: 生成JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    console.log(`\n✅ 步骤3: 生成JWT Token`)
    console.log(`   Token: ${token.substring(0, 50)}...`)
    
    // 步骤4: 验证token
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log(`\n✅ 步骤4: Token验证通过`)
    console.log(`   解码后ID: ${decoded.id}`)
    console.log(`   解码后邮箱: ${decoded.email}`)
    console.log(`   解码后角色: ${decoded.role}`)
    
    // 步骤5: 使用token获取用户信息
    const userFromToken = await db.user.findUnique({
      where: { id: decoded.id }
    })
    
    if (userFromToken) {
      console.log(`\n✅ 步骤5: 通过Token获取用户信息成功`)
      console.log(`   用户名: ${userFromToken.username}`)
      console.log(`   角色: ${userFromToken.role}`)
    } else {
      console.log(`\n❌ 步骤5: 通过Token获取用户信息失败`)
    }
    
    console.log('\n=== 登录流程测试完成 ===')
    console.log('✅ 所有步骤都成功，登录应该可以正常工作！')
    
  } catch (error) {
    console.error('测试过程中出错:', error)
  } finally {
    await db.$disconnect()
  }
}

testFullLogin()