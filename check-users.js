import { db } from './src/lib/db.js'

async function checkUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
    
    console.log('=== 数据库中的所有用户 ===')
    users.forEach(user => {
      console.log(`ID: ${user.id}`)
      console.log(`用户名: ${user.username}`)
      console.log(`邮箱: ${user.email}`)
      console.log(`姓名: ${user.name}`)
      console.log(`角色: ${user.role}`)
      console.log(`激活状态: ${user.isActive}`)
      console.log(`创建时间: ${user.createdAt}`)
      console.log('---')
    })
    
    if (users.length === 0) {
      console.log('数据库中没有找到任何用户！')
    }
    
  } catch (error) {
    console.error('检查用户时出错:', error)
  } finally {
    await db.$disconnect()
  }
}

checkUsers()