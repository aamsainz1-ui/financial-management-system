// 测试登录API的脚本
async function testLoginAPI() {
  try {
    console.log('=== 测试登录API ===')
    
    const testData = [
      { username: 'owner', password: '123456' },
      { username: 'admin', password: '123456' },
      { username: 'editor', password: '123456' },
      { username: 'viewer', password: '123456' }
    ]
    
    for (const data of testData) {
      console.log(`\n测试用户: ${data.username}`)
      
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      console.log(`状态码: ${response.status}`)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ 登录成功!')
        console.log(`用户ID: ${result.user.id}`)
        console.log(`用户名: ${result.user.username}`)
        console.log(`角色: ${result.user.role}`)
        console.log(`Token: ${result.token.substring(0, 50)}...`)
      } else {
        const error = await response.json()
        console.log('❌ 登录失败!')
        console.log(`错误: ${error.error}`)
      }
    }
    
  } catch (error) {
    console.error('API测试失败:', error)
  }
}

// 运行测试
testLoginAPI()