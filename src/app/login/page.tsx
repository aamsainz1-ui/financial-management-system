'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { User } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Form submitted with:', { username, pin, pinLength: pin.length })

    if (pin.length !== 6) {
      setError('กรุณากรอก PIN 6 หลักให้ครบ')
      setLoading(false)
      return
    }

    try {
      console.log('About to call login with:', { username, password: pin })
      const success = await login(username, pin)
      console.log('Login result:', success)
      
      if (success) {
        router.push('/')
      } else {
        setError('ชื่อผู้ใช้หรือ PIN ไม่ถูกต้อง')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</CardTitle>
              <CardDescription className="text-gray-600">
                กรอกชื่อผู้ใช้และ PIN 6 หลักเพื่อเข้าใช้งาน
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    ชื่อผู้ใช้
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="กรอกชื่อผู้ใช้ของคุณ"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12 text-base"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-sm font-medium text-gray-700">
                    PIN 6 หลัก
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="กรอก PIN 6 หลัก"
                    value={pin}
                    onChange={(e) => {
                      // 只允许数字，最多6位
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                      setPin(value)
                    }}
                    required
                    className="h-12 text-base"
                    autoComplete="current-password"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500">
                    กรอกตัวเลข 6 หลัก (ทดสอบ: 123456)
                  </p>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium" 
                disabled={loading || pin.length !== 6}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </div>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </Button>
            </form>
            
            <div className="space-y-4 pt-4 border-t">
              <div className="text-center text-sm">
                <span className="text-gray-600">ยังไม่มีบัญชี? </span>
                <Link 
                  href="/register" 
                  className="text-primary hover:underline font-medium"
                >
                  สมัครสมาชิก
                </Link>
              </div>
              <div className="text-center">
                <Link 
                  href="/forgot-pin" 
                  className="text-primary hover:underline text-sm font-medium"
                >
                  ลืม PIN?
                </Link>
              </div>
            </div>

            {/* Demo accounts info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-blue-900 text-sm">บัญชีสำหรับทดสอบ</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <div><strong>Owner:</strong> owner / 123456</div>
                <div><strong>Admin:</strong> admin / 123456</div>
                <div><strong>Editor:</strong> editor / 123456</div>
                <div><strong>Viewer:</strong> viewer / 123456</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}