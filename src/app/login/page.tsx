'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext'
import { User, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // แสดงข้อความจาก query params
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }

    // โหลดข้อมูล remember me
    const saved = localStorage.getItem('rememberUsername')
    if (saved) {
      setUsername(saved)
      setRememberMe(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    if (pin.length !== 6) {
      setError('กรุณากรอก PIN 6 หลักให้ครบ')
      setLoading(false)
      return
    }

    try {
      const success = await login(username, pin)

      if (success) {
        // บันทึกชื่อผู้ใช้ถ้าเลือก remember me
        if (rememberMe) {
          localStorage.setItem('rememberUsername', username)
        } else {
          localStorage.removeItem('rememberUsername')
        }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-xl border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ยินดีต้อนรับกลับ
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  เข้าสู่ระบบเพื่อดำเนินการต่อ
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 ml-2">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  ชื่อผู้ใช้
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้ของคุณ"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              {/* PIN Field */}
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  PIN 6 หลัก
                </Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    placeholder="กรอก PIN 6 หลัก"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                      setPin(value)
                    }}
                    required
                    className="h-12 text-base pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    autoComplete="current-password"
                    maxLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {pin.length}/6 หลัก
                  </span>
                  {pin.length === 6 && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ครบถ้วน
                    </span>
                  )}
                </div>
              </div>

              {/* Remember Me & Forgot PIN */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={loading}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    จดจำฉัน
                  </Label>
                </div>
                <Link
                  href="/forgot-pin"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  ลืม PIN?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                disabled={loading || pin.length !== 6 || !username}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </div>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="text-center text-sm">
                <span className="text-gray-600">ยังไม่มีบัญชี? </span>
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  สมัครสมาชิกฟรี
                </Link>
              </div>
            </div>

            {/* Demo Accounts Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                บัญชีทดสอบ
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded-lg p-2 border border-blue-100">
                  <div className="font-medium text-blue-900">Owner</div>
                  <div className="text-blue-700">owner / 123456</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-blue-100">
                  <div className="font-medium text-blue-900">Admin</div>
                  <div className="text-blue-700">admin / 123456</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-blue-100">
                  <div className="font-medium text-blue-900">Editor</div>
                  <div className="text-blue-700">editor / 123456</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-blue-100">
                  <div className="font-medium text-blue-900">Viewer</div>
                  <div className="text-blue-700">viewer / 123456</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2025 Financial Management System</p>
          <p className="mt-1">ปลอดภัยและเชื่อถือได้</p>
        </div>
      </div>
    </div>
  )
}
