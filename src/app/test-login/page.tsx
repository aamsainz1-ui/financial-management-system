'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SimpleLoginTest() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('')
    
    try {
      console.log('尝试登录:', { username, password })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      console.log('响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ 登录成功! 用户: ${data.user.username}, 角色: ${data.user.role}`)
        console.log('登录成功:', data)
      } else {
        const error = await response.json()
        setResult(`❌ 登录失败: ${error.error}`)
        console.log('登录失败:', error)
      }
    } catch (error: any) {
      setResult(`❌ 错误: ${error?.message || 'Unknown error'}`)
      console.error('登录错误:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>简单登录测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">用户名</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名 (如: owner)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">密码</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码 (如: 123456)"
            />
          </div>
          
          <Button 
            onClick={testLogin} 
            disabled={loading || !username || !password}
            className="w-full"
          >
            {loading ? '测试中...' : '测试登录'}
          </Button>
          
          {result && (
            <Alert className={result.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={result.includes('✅') ? 'text-green-700' : 'text-red-700'}>
                {result}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>测试账号:</p>
            <p>• owner/123456 (所有者)</p>
            <p>• admin/123456 (管理员)</p>
            <p>• editor/123456 (编辑者)</p>
            <p>• viewer/123456 (查看者)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}